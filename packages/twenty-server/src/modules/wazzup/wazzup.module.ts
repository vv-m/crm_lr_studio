import { Module } from '@nestjs/common';

import { WazzupApiService } from 'src/modules/wazzup/services/wazzup-api.service';
import { WazzupChannelSyncService } from 'src/modules/wazzup/services/wazzup-channel-sync.service';
import { WazzupWebhookController } from 'src/modules/wazzup/controllers/wazzup-webhook.controller';
import { WazzupMessageResolver } from 'src/modules/wazzup/resolvers/wazzup-message.resolver';

@Module({
  controllers: [WazzupWebhookController],
  providers: [WazzupApiService, WazzupChannelSyncService, WazzupMessageResolver],
  exports: [WazzupApiService, WazzupChannelSyncService],
})
export class WazzupModule {}
