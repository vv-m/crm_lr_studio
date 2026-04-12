import { UseFilters, UseGuards } from '@nestjs/common';
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

        // Send message via Wazzup API
        const sendResult = await this.wazzupApiService.sendMessage(
          wazzupAccount.apiKey,
          wazzupChannel.externalChannelId,
          dialog.chatType,
          dialog.chatId,
          text,
          contentUri,
        );

        // Create dialog message record
        const dialogMessageRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogMessageWorkspaceEntity>(
            workspace.id,
            'dialogMessage',
            { shouldBypassPermissionChecks: true },
          );

        const now = new Date();
        const messagePreview = text?.substring(0, 255) ?? null;

        const savedMessage = await dialogMessageRepository.save({
          externalMessageId: sendResult.messageId,
          direction: 'OUTBOUND',
          messageType: contentUri ? 'file' : 'text',
          text: text ?? null,
          contentUri: contentUri ?? null,
          status: 'sent',
          sentAt: now,
          name: messagePreview ?? 'OUTBOUND',
          dialogId: dialog.id,
        });

        // Update dialog with latest message info
        await dialogRepository.update(dialog.id, {
          lastMessageAt: now,
          lastMessagePreview: messagePreview,
        });

        return {
          id: (savedMessage as DialogMessageWorkspaceEntity).id,
          externalMessageId: sendResult.messageId,
          direction: 'OUTBOUND',
          messageType: contentUri ? 'file' : 'text',
          text: text ?? null,
          contentUri: contentUri ?? null,
          status: 'sent',
          sentAt: now,
        };
      },
      authContext,
    );
  }
}
