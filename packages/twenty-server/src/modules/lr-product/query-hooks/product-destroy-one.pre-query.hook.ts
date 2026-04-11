import { Injectable } from '@nestjs/common';
import { msg } from '@lingui/core/macro';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DestroyOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type OpportunityProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/opportunity-product.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`product.destroyOne`)
export class ProductDestroyOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: DestroyOneResolverArgs,
  ): Promise<DestroyOneResolverArgs> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const authContextForOrm = buildSystemAuthContext(workspace.id);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityProductRepository =
          await this.globalWorkspaceOrmManager.getRepository<OpportunityProductWorkspaceEntity>(
            workspace.id,
            'opportunityProduct',
            { shouldBypassPermissionChecks: true },
          );

        const lines = await opportunityProductRepository.findBy({
          productId: payload.id,
        });

        if (lines.length > 0) {
          throw new CommonQueryRunnerException(
            'Cannot destroy product that is referenced by opportunity lines',
            CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
            {
              userFriendlyMessage: msg`This product cannot be permanently deleted while it is used on deals. Remove it from all deal lines first.`,
            },
          );
        }
      },
      authContextForOrm,
    );

    return payload;
  }
}
