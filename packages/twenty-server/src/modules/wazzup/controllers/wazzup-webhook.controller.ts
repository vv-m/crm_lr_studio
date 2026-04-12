import { Body, Controller, HttpCode, Logger, Param, Post } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { type WazzupAccountWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-account.workspace-entity';
import { type DialogWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog.workspace-entity';
import { type DialogMessageWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-message.workspace-entity';
import { WazzupChannelSyncService } from 'src/modules/wazzup/services/wazzup-channel-sync.service';

type WazzupWebhookContact = {
  name: string;
  phone: string;
};

type WazzupWebhookMessage = {
  messageId: string;
  channelId: string;
  chatType: string;
  chatId: string;
  dateTime: string;
  type: string;
  text?: string;
  contentUri?: string;
  isEcho: boolean;
  contact: WazzupWebhookContact;
  status?: string;
};

type WazzupWebhookPayload = {
  messages?: WazzupWebhookMessage[];
};

@Controller('wazzup')
export class WazzupWebhookController {
  private readonly logger = new Logger(WazzupWebhookController.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly wazzupChannelSyncService: WazzupChannelSyncService,
  ) {}

  @Post('sync-channels/:workspaceId')
  async syncChannels(
    @Param('workspaceId') workspaceId: string,
  ): Promise<{ synced: number }> {
    const authContext = buildSystemAuthContext(workspaceId);

    let syncedCount = 0;

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const accountRepository =
          await this.globalWorkspaceOrmManager.getRepository<WazzupAccountWorkspaceEntity>(
            workspaceId,
            'wazzupAccount',
            { shouldBypassPermissionChecks: true },
          );

        const accounts = await accountRepository.find({
          where: { isActive: true },
        });

        for (const account of accounts) {
          await this.wazzupChannelSyncService.syncChannels(
            workspaceId,
            account.id,
            account.apiKey,
          );
          syncedCount++;
        }
      },
      authContext,
    );

    return { synced: syncedCount };
  }

  @Post('webhook/:workspaceId')
  @HttpCode(200)
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Body() payload: WazzupWebhookPayload | undefined,
  ): Promise<{ ok: boolean }> {
    if (!payload?.messages || payload.messages.length === 0) {
      return { ok: true };
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const channelRepository =
          await this.globalWorkspaceOrmManager.getRepository<WazzupChannelWorkspaceEntity>(
            workspaceId,
            'wazzupChannel',
            { shouldBypassPermissionChecks: true },
          );

        const dialogRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogWorkspaceEntity>(
            workspaceId,
            'dialog',
            { shouldBypassPermissionChecks: true },
          );

        const dialogMessageRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogMessageWorkspaceEntity>(
            workspaceId,
            'dialogMessage',
            { shouldBypassPermissionChecks: true },
          );

        for (const message of payload.messages!) {
          try {
            await this.processMessage(
              message,
              channelRepository,
              dialogRepository,
              dialogMessageRepository,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process webhook message ${message.messageId}: ${error}`,
            );
          }
        }
      },
      authContext,
    );

    return { ok: true };
  }

  private async processMessage(
    message: WazzupWebhookMessage,
    channelRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
    dialogRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
    dialogMessageRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
  ): Promise<void> {
    // Find the channel
    const channel = await channelRepository.findOne({
      where: { externalChannelId: message.channelId },
    });

    if (!channel) {
      this.logger.warn(
        `Received webhook for unknown channel ${message.channelId}`,
      );

      return;
    }

    // Find or create dialog
    let dialog = await dialogRepository.findOne({
      where: {
        chatId: message.chatId,
        wazzupChannelId: (channel as WazzupChannelWorkspaceEntity).id,
      },
    });

    if (!dialog) {
      dialog = await dialogRepository.save({
        chatId: message.chatId,
        chatType: message.chatType,
        contactName: message.contact.name,
        contactPhone: message.contact.phone,
        name: message.contact.name || message.contact.phone || message.chatId,
        status: 'OPEN',
        wazzupChannelId: (channel as WazzupChannelWorkspaceEntity).id,
        lastMessageAt: new Date(message.dateTime),
        lastMessagePreview: message.text?.substring(0, 255) ?? null,
      });
    }

    const direction = message.isEcho ? 'OUTBOUND' : 'INBOUND';
    const messagePreview = message.text?.substring(0, 255) ?? null;

    // Create dialog message
    await dialogMessageRepository.save({
      externalMessageId: message.messageId,
      direction,
      messageType: message.type,
      text: message.text ?? null,
      contentUri: message.contentUri ?? null,
      status: message.status ?? 'delivered',
      sentAt: new Date(message.dateTime),
      name: messagePreview ?? direction,
      dialogId: (dialog as DialogWorkspaceEntity).id,
    });

    // Update dialog with latest message info
    await dialogRepository.update((dialog as DialogWorkspaceEntity).id, {
      lastMessageAt: new Date(message.dateTime),
      lastMessagePreview: messagePreview,
      contactName:
        message.contact.name ||
        (dialog as DialogWorkspaceEntity).contactName,
      contactPhone:
        message.contact.phone ||
        (dialog as DialogWorkspaceEntity).contactPhone,
    });
  }
}
