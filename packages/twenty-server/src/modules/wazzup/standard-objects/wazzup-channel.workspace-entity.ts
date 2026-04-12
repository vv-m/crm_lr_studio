import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WazzupAccountWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-account.workspace-entity';
import { type DialogWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog.workspace-entity';
import { type ActorMetadata } from 'twenty-shared/types';

export class WazzupChannelWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  externalChannelId: string;
  transport: string;
  state: string;
  plainId: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;
  wazzupAccount: EntityRelation<WazzupAccountWorkspaceEntity> | null;
  wazzupAccountId: string | null;
  dialogs: EntityRelation<DialogWorkspaceEntity[]>;
}
