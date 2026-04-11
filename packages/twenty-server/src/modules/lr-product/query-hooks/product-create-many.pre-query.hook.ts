import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ProductWorkspaceEntity } from 'src/modules/lr-product/standard-objects/product.workspace-entity';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
@WorkspaceQueryHook(`product.createMany`)
export class ProductCreateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<Partial<ProductWorkspaceEntity>>,
  ): Promise<CreateManyResolverArgs<Partial<ProductWorkspaceEntity>>> {
    return {
      ...payload,
      data: payload.data.map((row) => {
        const name = row.name;

        if (!isDefined(name) || name === null) {
          return {
            ...row,
            name: '',
          };
        }

        return row;
      }),
    };
  }
}
