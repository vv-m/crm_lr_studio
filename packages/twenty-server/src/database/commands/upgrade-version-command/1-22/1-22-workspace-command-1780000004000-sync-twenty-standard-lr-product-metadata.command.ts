import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { TwentyStandardApplicationService } from 'src/engine/workspace-manager/twenty-standard-application/services/twenty-standard-application.service';

@RegisteredWorkspaceCommand('1.22.0', 1780000004000)
@Command({
  name: 'upgrade:1-22:sync-twenty-standard-lr-product-metadata',
  description:
    'Synchronize Twenty standard application metadata with the codebase (adds Product, Opportunity product, and related standard entities for workspaces created before those objects existed).',
})
export class SyncTwentyStandardLrProductMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly twentyStandardApplicationService: TwentyStandardApplicationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Synchronizing Twenty standard application metadata for workspace ${workspaceId}`,
    );

    await this.twentyStandardApplicationService.synchronizeTwentyStandardApplicationOrThrow(
      {
        workspaceId,
      },
    );

    this.logger.log(
      `Finished Twenty standard application metadata sync for workspace ${workspaceId}`,
    );
  }
}
