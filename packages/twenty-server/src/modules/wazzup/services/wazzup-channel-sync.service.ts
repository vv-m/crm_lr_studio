import { Injectable, Logger } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { WazzupApiService } from 'src/modules/wazzup/services/wazzup-api.service';

@Injectable()
export class WazzupChannelSyncService {
  private readonly logger = new Logger(WazzupChannelSyncService.name);

  constructor(
    private readonly wazzupApiService: WazzupApiService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async syncChannels(
    workspaceId: string,
    wazzupAccountId: string,
    apiKey: string,
  ): Promise<void> {
    const channels = await this.wazzupApiService.getChannels(apiKey);

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const channelRepository =
          await this.globalWorkspaceOrmManager.getRepository<WazzupChannelWorkspaceEntity>(
            workspaceId,
            'wazzupChannel',
            { shouldBypassPermissionChecks: true },
          );

        for (const channel of channels) {
          const existingChannel = await channelRepository.findOne({
            where: {
              externalChannelId: channel.channelId,
              wazzupAccountId,
            },
          });

          if (existingChannel) {
            await channelRepository.update(existingChannel.id, {
              transport: channel.transport,
              state: channel.state,
              plainId: channel.plainId,
            });

            this.logger.log(
              `Updated wazzup channel ${channel.channelId} for account ${wazzupAccountId}`,
            );
          } else {
            await channelRepository.save({
              externalChannelId: channel.channelId,
              transport: channel.transport,
              state: channel.state,
              plainId: channel.plainId,
              name: `${channel.transport} - ${channel.plainId}`,
              wazzupAccountId,
            });

            this.logger.log(
              `Created wazzup channel ${channel.channelId} for account ${wazzupAccountId}`,
            );
          }
        }
      },
      authContext,
    );
  }
}
