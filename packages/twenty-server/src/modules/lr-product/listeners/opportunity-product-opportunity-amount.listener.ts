import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { OpportunityLineAmountReconciliationWorkspaceService } from 'src/modules/lr-product/services/opportunity-line-amount-reconciliation.workspace-service';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';

type OpportunityProductBatchEvent = WorkspaceEventBatch<
  | ObjectRecordCreateEvent<OpportunityProductWorkspaceEntity>
  | ObjectRecordUpdateEvent<OpportunityProductWorkspaceEntity>
  | ObjectRecordDeleteEvent<OpportunityProductWorkspaceEntity>
  | ObjectRecordDestroyEvent<OpportunityProductWorkspaceEntity>
  | ObjectRecordRestoreEvent<OpportunityProductWorkspaceEntity>
>;

@Injectable()
export class OpportunityProductOpportunityAmountListener {
  constructor(
    private readonly opportunityLineAmountReconciliationWorkspaceService: OpportunityLineAmountReconciliationWorkspaceService,
  ) {}

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.CREATED)
  async handleOpportunityProductCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.reconcileFromBatch(batchEvent);
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.UPDATED)
  async handleOpportunityProductUpdated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.reconcileFromBatch(batchEvent);
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.DELETED)
  async handleOpportunityProductDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.reconcileFromBatch(batchEvent);
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.DESTROYED)
  async handleOpportunityProductDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.reconcileFromBatch(batchEvent);
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.RESTORED)
  async handleOpportunityProductRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.reconcileFromBatch(batchEvent);
  }

  private async reconcileFromBatch(
    batchEvent: OpportunityProductBatchEvent,
  ): Promise<void> {
    if (!isDefined(batchEvent.workspaceId)) {
      return;
    }

    const opportunityIds = new Set<string>();

    for (const event of batchEvent.events) {
      if ('after' in event.properties && isDefined(event.properties.after)) {
        const opportunityId = event.properties.after.opportunityId;

        if (isDefined(opportunityId)) {
          opportunityIds.add(opportunityId);
        }
      }

      if ('before' in event.properties && isDefined(event.properties.before)) {
        const opportunityId = event.properties.before.opportunityId;

        if (isDefined(opportunityId)) {
          opportunityIds.add(opportunityId);
        }
      }
    }

    await this.opportunityLineAmountReconciliationWorkspaceService.recomputeOpportunityAmountForOpportunityIds(
      {
        workspaceId: batchEvent.workspaceId,
        opportunityIds: [...opportunityIds],
      },
    );
  }
}
