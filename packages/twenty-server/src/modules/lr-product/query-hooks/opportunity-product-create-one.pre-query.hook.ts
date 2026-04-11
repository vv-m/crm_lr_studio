import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { assertOpportunityProductQuantityIsValid } from 'src/modules/lr-product/query-hooks/utils/validate-opportunity-product-quantity.util';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`opportunityProduct.createOne`)
export class OpportunityProductCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<Partial<OpportunityProductWorkspaceEntity>>,
  ): Promise<
    CreateOneResolverArgs<Partial<OpportunityProductWorkspaceEntity>>
  > {
    const quantity = payload.data.quantity;

    if (quantity === undefined || quantity === null) {
      throw new CommonQueryRunnerException(
        'Opportunity product quantity is required',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`Quantity is required.`,
        },
      );
    }

    assertOpportunityProductQuantityIsValid(quantity);

    return payload;
  }
}
