import { Injectable, Logger } from '@nestjs/common';

const WAZZUP_API_BASE_URL = 'https://api.wazzup24.com/v3';

type WazzupSendMessageResponse = {
  messageId: string;
  chatId: string;
};

type WazzupChannel = {
  channelId: string;
  transport: string;
  state: string;
  plainId: string;
};

@Injectable()
export class WazzupApiService {
  private readonly logger = new Logger(WazzupApiService.name);

  async sendMessage(
    apiKey: string,
    channelId: string,
    chatType: string,
    chatId: string,
    text?: string,
    contentUri?: string,
  ): Promise<WazzupSendMessageResponse> {
    const body: Record<string, string | undefined> = {
      channelId,
      chatType,
      chatId,
      text,
      contentUri,
    };

    const response = await fetch(`${WAZZUP_API_BASE_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      this.logger.error(
        `Failed to send message via Wazzup API: ${response.status} ${errorBody}`,
      );

      throw new Error(
        `Wazzup API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<WazzupSendMessageResponse>;
  }

  async getChannels(apiKey: string): Promise<WazzupChannel[]> {
    const response = await fetch(`${WAZZUP_API_BASE_URL}/channels`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();

      this.logger.error(
        `Failed to get channels from Wazzup API: ${response.status} ${errorBody}`,
      );

      throw new Error(
        `Wazzup API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<WazzupChannel[]>;
  }

  async registerWebhook(apiKey: string, webhookUrl: string): Promise<void> {
    const response = await fetch(`${WAZZUP_API_BASE_URL}/webhooks`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        webhooksUri: webhookUrl,
        subscriptions: {
          messagesAndStatuses: true,
          contactsAndDealsCreation: false,
          channelsUpdates: true,
          templateStatus: false,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      this.logger.error(
        `Failed to register webhook via Wazzup API: ${response.status} ${errorBody}`,
      );

      throw new Error(
        `Wazzup API error: ${response.status} ${response.statusText}`,
      );
    }
  }
}
