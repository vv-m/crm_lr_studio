import { Body, Controller, HttpCode, Logger, Param, Post } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { type WazzupAccountWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-account.workspace-entity';
import { type DialogWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog.workspace-entity';
import { type DialogMessageWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-message.workspace-entity';
import { type DialogTargetWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-target.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
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

        const dialogTargetRepository =
          await this.globalWorkspaceOrmManager.getRepository<DialogTargetWorkspaceEntity>(
            workspaceId,
            'dialogTarget',
            { shouldBypassPermissionChecks: true },
          );

        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
            { shouldBypassPermissionChecks: true },
          );

        for (const message of payload.messages!) {
          try {
            await this.processMessage(
              message,
              channelRepository,
              dialogRepository,
              dialogMessageRepository,
              dialogTargetRepository,
              personRepository,
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
    dialogTargetRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
    personRepository: Awaited<
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

      // Auto-link new dialog to Person by phone number
      await this.autoLinkDialogByPhone(
        dialog as DialogWorkspaceEntity,
        message.contact.phone,
        personRepository,
        dialogTargetRepository,
      );
    }

    const direction = message.isEcho ? 'OUTBOUND' : 'INBOUND';
    const messagePreview = message.text?.substring(0, 255) ?? null;

    // Skip duplicate messages (e.g. echo of a message sent via API)
    const existingMessage = await dialogMessageRepository.findOne({
      where: { externalMessageId: message.messageId },
    });

    if (!existingMessage) {
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
    }

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

  private normalizePhone(phone: string): string {
    return phone.replace(/[^0-9]/g, '').slice(-10);
  }

  private async autoLinkDialogByPhone(
    dialog: DialogWorkspaceEntity,
    contactPhone: string | undefined,
    personRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
    dialogTargetRepository: Awaited<
      ReturnType<typeof this.globalWorkspaceOrmManager.getRepository>
    >,
  ): Promise<void> {
    if (!contactPhone) {
      return;
    }

    const normalizedPhone = this.normalizePhone(contactPhone);

    if (normalizedPhone.length < 10) {
      return;
    }

    try {
      const person = await (personRepository as any)
        .createQueryBuilder('person')
        .where(
          `REGEXP_REPLACE("phonesPrimaryPhoneNumber", '[^0-9]', '', 'g') LIKE :phoneSuffix`,
          { phoneSuffix: `%${normalizedPhone}` },
        )
        .getOne();

      if (person) {
        await dialogTargetRepository.save({
          dialogId: dialog.id,
          targetPersonId: (person as PersonWorkspaceEntity).id,
        });

        this.logger.log(
          `Auto-linked dialog ${dialog.id} to person ${(person as PersonWorkspaceEntity).id} by phone ${normalizedPhone}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to auto-link dialog ${dialog.id} by phone: ${error}`,
      );
    }
  }
}
