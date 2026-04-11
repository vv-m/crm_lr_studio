import { Module } from '@nestjs/common';

import { OpportunityProductOpportunityAmountListener } from 'src/modules/lr-product/listeners/opportunity-product-opportunity-amount.listener';
import { OpportunityProductTimelineActivityListener } from 'src/modules/lr-product/listeners/opportunity-product-timeline-activity.listener';
import { OpportunityProductCreateManyPreQueryHook } from 'src/modules/lr-product/query-hooks/opportunity-product-create-many.pre-query.hook';
import { OpportunityProductCreateOnePreQueryHook } from 'src/modules/lr-product/query-hooks/opportunity-product-create-one.pre-query.hook';
import { OpportunityProductUpdateOnePreQueryHook } from 'src/modules/lr-product/query-hooks/opportunity-product-update-one.pre-query.hook';
import { ProductCreateManyPreQueryHook } from 'src/modules/lr-product/query-hooks/product-create-many.pre-query.hook';
import { ProductCreateOnePreQueryHook } from 'src/modules/lr-product/query-hooks/product-create-one.pre-query.hook';
import { ProductDestroyManyPreQueryHook } from 'src/modules/lr-product/query-hooks/product-destroy-many.pre-query.hook';
import { ProductDestroyOnePreQueryHook } from 'src/modules/lr-product/query-hooks/product-destroy-one.pre-query.hook';
import { OpportunityLineAmountReconciliationWorkspaceService } from 'src/modules/lr-product/services/opportunity-line-amount-reconciliation.workspace-service';

@Module({
  providers: [
    OpportunityLineAmountReconciliationWorkspaceService,
    OpportunityProductOpportunityAmountListener,
    OpportunityProductTimelineActivityListener,
    OpportunityProductCreateOnePreQueryHook,
    OpportunityProductCreateManyPreQueryHook,
    OpportunityProductUpdateOnePreQueryHook,
    ProductCreateOnePreQueryHook,
    ProductCreateManyPreQueryHook,
    ProductDestroyOnePreQueryHook,
    ProductDestroyManyPreQueryHook,
  ],
})
export class LrProductModule {}
