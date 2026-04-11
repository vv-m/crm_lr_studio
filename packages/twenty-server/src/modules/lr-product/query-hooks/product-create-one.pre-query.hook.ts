import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/product.workspace-entity';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
@WorkspaceQueryHook(`product.createOne`)
export class ProductCreateOnePreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<Partial<ProductWorkspaceEntity>>,
  ): Promise<CreateOneResolverArgs<Partial<ProductWorkspaceEntity>>> {
    const name = payload.data.name;

    if (!isDefined(name) || name === null) {
      return {
        ...payload,
        data: {
          ...payload.data,
          name: '',
        },
      };
    }

    return payload;
  }
}
