import { Logger, UseGuards } from '@nestjs/common';
import { Args, Field, Mutation, ObjectType } from '@nestjs/graphql';

import { CoreResolver } from 'src/engine/api/graphql/graphql-config/decorators/core-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type DialogWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog.workspace-entity';
import { type DialogMessageWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-message.workspace-entity';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { type WazzupAccountWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-account.workspace-entity';
import { WazzupApiService } from 'src/modules/wazzup/services/wazzup-api.service';

@ObjectType('SendDialogMessageResult')
class SendDialogMessageResult {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  externalMessageId: string | null;

  @Field(() => String)
  direction: string;

  @Field(() => String)
  messageType: string;

  @Field(() => String, { nullable: true })
  text: string | null;

  @Field(() => String, { nullable: true })
  contentUri: string | null;

  @Field(() => String)
  status: string;

  @Field(() => Date)
  sentAt: Date;
}

@CoreResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class WazzupMessageResolver {
  private readonly logger = new Logger(WazzupMessageResolver.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly wazzupApiService: WazzupApiService,
  ) {}

  @Mutation(() => SendDialogMessageResult)
  async sendDialogMessage(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('dialogId', { type: () => UUIDScalarType }) dialogId: string,
    @Args('text', { type: () => String, nullable: true }) text?: string,
    @Args('contentUri', { type: () => String, nullable: true })
    contentUri?: string,
    @Args('messageType', { type: () => String, nullable: true })
    messageType?: string,
  ): Promise<SendDialogMessageResult> {
    const authContext = buildSystemAuthContext(workspace.id);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const dialogRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogWorkspaceEntity>(
            workspace.id,
            'dialog',
            { shouldBypassPermissionChecks: true },
          );

        const dialog = await dialogRepository.findOne({
          where: { id: dialogId },
          relations: ['wazzupChannel'],
        });

        if (!dialog) {
          throw new Error(`Dialog with id ${dialogId} not found`);
        }

        const wazzupChannel =
          dialog.wazzupChannel as unknown as WazzupChannelWorkspaceEntity | null;

        if (!wazzupChannel) {
          throw new Error(
            `Dialog ${dialogId} is not linked to a wazzup channel`,
          );
        }

        // Load the wazzup account to get the API key
        const channelRepository =
          await this.globalWorkspaceOrmManager.getRepository<WazzupChannelWorkspaceEntity>(
            workspace.id,
            'wazzupChannel',
            { shouldBypassPermissionChecks: true },
          );

        const channelWithAccount = await channelRepository.findOne({
          where: { id: wazzupChannel.id },
          relations: ['wazzupAccount'],
        });

        if (!channelWithAccount) {
          throw new Error(
            `Wazzup channel ${wazzupChannel.id} not found`,
          );
        }

        const wazzupAccount =
          channelWithAccount.wazzupAccount as unknown as WazzupAccountWorkspaceEntity | null;

        if (!wazzupAccount) {
          throw new Error(
            `Wazzup channel ${wazzupChannel.id} is not linked to a wazzup account`,
          );
        }

        // Wazzup API constraint: text and contentUri CANNOT be sent
        // simultaneously. When both are provided we send two separate
        // API calls: file first, then text.
        // contentUri must be a publicly accessible URL (no localhost).

        const dialogMessageRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogMessageWorkspaceEntity>(
            workspace.id,
            'dialogMessage',
            { shouldBypassPermissionChecks: true },
          );

        const now = new Date();
        const messagePreview = text?.substring(0, 255) ?? null;

        let savedFileMessage: DialogMessageWorkspaceEntity | null = null;
        let fileMessageStatus = 'sent';

        // 1. Send file message (if contentUri provided)
        if (contentUri) {
          let fileExternalId: string | null = null;

          try {
            const result = await this.wazzupApiService.sendMessage(
              wazzupAccount.apiKey,
              wazzupChannel.externalChannelId,
              dialog.chatType,
              dialog.chatId,
              undefined,
              contentUri,
            );

            fileExternalId = result.messageId;
          } catch (error) {
            this.logger.warn(
              `Failed to send file via Wazzup: ${error}`,
            );
            fileMessageStatus = 'failed';
          }

          savedFileMessage = (await dialogMessageRepository.save({
            externalMessageId: fileExternalId,
            direction: 'OUTBOUND',
            messageType: messageType ?? 'file',
            text: null,
            contentUri,
            status: fileMessageStatus,
            sentAt: now,
            name: 'OUTBOUND',
            dialogId: dialog.id,
          })) as DialogMessageWorkspaceEntity;
        }

        // 2. Send text message (if text provided)
        let savedTextMessage: DialogMessageWorkspaceEntity | null = null;

        if (text) {
          const textResult = await this.wazzupApiService.sendMessage(
            wazzupAccount.apiKey,
            wazzupChannel.externalChannelId,
            dialog.chatType,
            dialog.chatId,
            text,
          );

          savedTextMessage = (await dialogMessageRepository.save({
            externalMessageId: textResult.messageId || null,
            direction: 'OUTBOUND',
            messageType: 'text',
            text,
            contentUri: null,
            status: 'sent',
            sentAt: now,
            name: messagePreview ?? 'OUTBOUND',
            dialogId: dialog.id,
          })) as DialogMessageWorkspaceEntity;
        }

        // Update dialog with latest message info
        await dialogRepository.update(dialog.id, {
          lastMessageAt: now,
          lastMessagePreview: messagePreview ?? (contentUri ? 'File' : null),
        });

        // Return the last saved message
        const lastSaved = savedTextMessage ?? savedFileMessage;

        if (!lastSaved) {
          throw new Error('No message was sent');
        }

        return {
          id: lastSaved.id,
          externalMessageId: lastSaved.externalMessageId ?? null,
          direction: 'OUTBOUND',
          messageType: lastSaved.messageType ?? 'text',
          text: lastSaved.text ?? null,
          contentUri: lastSaved.contentUri ?? null,
          status: lastSaved.status ?? 'sent',
          sentAt: now,
        };
      },
      authContext,
    );
  }
}
