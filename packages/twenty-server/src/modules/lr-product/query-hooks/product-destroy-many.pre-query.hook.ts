import { msg } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DestroyManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

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
@WorkspaceQueryHook(`product.destroyMany`)
export class ProductDestroyManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: DestroyManyResolverArgs<{ id: { in: string[] } }>,
  ): Promise<DestroyManyResolverArgs<{ id: { in: string[] } }>> {
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

        for (const productId of payload.filter.id.in) {
          const lines = await opportunityProductRepository.findBy({
            productId,
          });

          if (lines.length > 0) {
            throw new CommonQueryRunnerException(
              'Cannot destroy product that is referenced by opportunity lines',
              CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
              {
                userFriendlyMessage: msg`One or more products cannot be permanently deleted while they are used on deals. Remove them from all deal lines first.`,
              },
            );
          }
        }
      },
      authContextForOrm,
    );

    return payload;
  }
}
