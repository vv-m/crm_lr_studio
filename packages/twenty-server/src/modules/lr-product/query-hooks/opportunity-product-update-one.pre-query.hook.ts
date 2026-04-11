import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { assertOpportunityProductQuantityIsValid } from 'src/modules/lr-product/query-hooks/utils/validate-opportunity-product-quantity.util';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`opportunityProduct.updateOne`)
export class OpportunityProductUpdateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateOneResolverArgs<OpportunityProductWorkspaceEntity>,
  ): Promise<UpdateOneResolverArgs<OpportunityProductWorkspaceEntity>> {
    if ('quantity' in payload.data) {
      assertOpportunityProductQuantityIsValid(payload.data.quantity);
    }

    return payload;
  }
}
