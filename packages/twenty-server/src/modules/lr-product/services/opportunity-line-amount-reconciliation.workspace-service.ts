import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';

@Injectable()
export class OpportunityLineAmountReconciliationWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async recomputeOpportunityAmountForOpportunityIds({
    workspaceId,
    opportunityIds,
  }: {
    workspaceId: string;
    opportunityIds: string[];
  }): Promise<void> {
    const uniqueOpportunityIds = [...new Set(opportunityIds)];

    if (uniqueOpportunityIds.length === 0) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityProductRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityProductWorkspaceEntity>(
            workspaceId,
            'opportunityProduct',
            { shouldBypassPermissionChecks: true },
          );

        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
            workspaceId,
            'opportunity',
            { shouldBypassPermissionChecks: true },
          );

        for (const opportunityId of uniqueOpportunityIds) {
          const opportunity = await opportunityRepository.findOne({
            where: { id: opportunityId },
          });

          if (!opportunity) {
            continue;
          }

          const lines = await opportunityProductRepository.findBy({
            opportunityId,
          });

          if (lines.length === 0) {
            await opportunityRepository.update(opportunityId, {
              amount: null,
            });
            continue;
          }

          const currencyCodeFromOpportunity = opportunity.amount?.currencyCode;
          const currencyCodeFromLine = lines.find(
            (line) => isDefined(line.unitPrice?.currencyCode),
          )?.unitPrice?.currencyCode;

          const resolvedCurrencyCode =
            currencyCodeFromOpportunity ?? currencyCodeFromLine;

          if (!isDefined(resolvedCurrencyCode)) {
            await opportunityRepository.update(opportunityId, {
              amount: null,
            });
            continue;
          }

          let totalAmountMicros = 0;

          for (const line of lines) {
            if (!isDefined(line.unitPrice)) {
              continue;
            }

            if (line.unitPrice.currencyCode !== resolvedCurrencyCode) {
              continue;
            }

            if (!isDefined(line.unitPrice.amountMicros) || !line.quantity) {
              continue;
            }

            totalAmountMicros +=
              line.quantity * line.unitPrice.amountMicros;
          }

          await opportunityRepository.update(opportunityId, {
            amount: {
              amountMicros: totalAmountMicros,
              currencyCode: resolvedCurrencyCode,
            },
          });
        }
      },
      authContext,
    );
  }
}
