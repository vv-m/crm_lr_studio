import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordRestoreEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';
import { type ProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/product.workspace-entity';

type TimelineEventAction = 'created' | 'deleted' | 'destroyed' | 'restored';

type TimelineEntry = {
  opportunityId: string;
  productId: string;
  workspaceMemberId: string | undefined;
};

@Injectable()
export class OpportunityProductTimelineActivityListener {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.CREATED)
  async handleCreated(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordCreateEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.recordTimelineEntries(batchEvent, 'created');
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.DELETED)
  async handleDeleted(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDeleteEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.recordTimelineEntries(batchEvent, 'deleted');
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.DESTROYED)
  async handleDestroyed(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordDestroyEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.recordTimelineEntries(batchEvent, 'destroyed');
  }

  @OnDatabaseBatchEvent('opportunityProduct', DatabaseEventAction.RESTORED)
  async handleRestored(
    batchEvent: WorkspaceEventBatch<
      ObjectRecordRestoreEvent<OpportunityProductWorkspaceEntity>
    >,
  ): Promise<void> {
    await this.recordTimelineEntries(batchEvent, 'restored');
  }

  private async recordTimelineEntries(
    batchEvent: WorkspaceEventBatch<
      | ObjectRecordCreateEvent<OpportunityProductWorkspaceEntity>
      | ObjectRecordDeleteEvent<OpportunityProductWorkspaceEntity>
      | ObjectRecordDestroyEvent<OpportunityProductWorkspaceEntity>
      | ObjectRecordRestoreEvent<OpportunityProductWorkspaceEntity>
    >,
    action: TimelineEventAction,
  ): Promise<void> {
    const workspaceId = batchEvent.workspaceId;

    if (!isDefined(workspaceId)) {
      return;
    }

    const usesAfterSnapshot = action === 'created' || action === 'restored';

    const entries: TimelineEntry[] = [];

    for (const event of batchEvent.events) {
      const snapshot = usesAfterSnapshot
        ? 'after' in event.properties
          ? event.properties.after
          : undefined
        : 'before' in event.properties
          ? event.properties.before
          : undefined;

      if (!isDefined(snapshot)) {
        continue;
      }

      const opportunityId = snapshot.opportunityId;
      const productId = snapshot.productId;

      if (!isDefined(opportunityId) || !isDefined(productId)) {
        continue;
      }

      entries.push({
        opportunityId,
        productId,
        workspaceMemberId: event.workspaceMemberId,
      });
    }

    if (entries.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const productRepository =
        await this.globalWorkspaceOrmManager.getRepository<ProductWorkspaceEntity>(
          workspaceId,
          'product',
          { shouldBypassPermissionChecks: true },
        );

      const uniqueProductIds = [
        ...new Set(entries.map((entry) => entry.productId)),
      ];

      const products = await productRepository.find({
        where: { id: In(uniqueProductIds) },
      });

      const productNameById = new Map<string, string>();

      for (const product of products) {
        productNameById.set(product.id, product.name ?? '');
      }

      const timelineActivityRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      await timelineActivityRepository.insert(
        entries.map((entry) => ({
          name: `linked-opportunityProduct.${action}`,
          properties: {},
          workspaceMemberId: entry.workspaceMemberId ?? null,
          targetOpportunityId: entry.opportunityId,
          linkedRecordCachedName: productNameById.get(entry.productId) ?? '',
          linkedRecordId: entry.productId,
          linkedObjectMetadataId: null,
        })),
      );
    }, authContext);
  }
}
