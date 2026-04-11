import {
  type ActorMetadata,
  type CurrencyMetadata,
  FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import type { OpportunityProductWorkspaceEntity } from './opportunity-product.workspace-entity';

const NAME_FIELD_NAME = 'name';
const ARTICUL_FIELD_NAME = 'artikul';

export const SEARCH_FIELDS_FOR_PRODUCT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: ARTICUL_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class ProductWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  artikul: string | null;
  currentPrice: CurrencyMetadata | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  opportunityProducts: EntityRelation<OpportunityProductWorkspaceEntity[]>;
  searchVector: string;
}
