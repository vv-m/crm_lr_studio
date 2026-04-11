import {
  type ActorMetadata,
  type CurrencyMetadata,
  FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import type { ProductWorkspaceEntity } from './product.workspace-entity';

export const SEARCH_FIELDS_FOR_OPPORTUNITY_PRODUCT: FieldTypeAndNameMetadata[] =
  [{ name: 'id', type: FieldMetadataType.UUID }];

export class OpportunityProductWorkspaceEntity extends BaseWorkspaceEntity {
  opportunity: EntityRelation<OpportunityWorkspaceEntity>;
  opportunityId: string;
  product: EntityRelation<ProductWorkspaceEntity>;
  productId: string;
  quantity: number;
  unitPrice: CurrencyMetadata | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;
}
