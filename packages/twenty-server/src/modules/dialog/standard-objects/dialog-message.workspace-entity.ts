import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type DialogWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog.workspace-entity';
import { type ActorMetadata } from 'twenty-shared/types';

export class DialogMessageWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  externalMessageId: string | null;
  direction: string;
  messageType: string;
  text: string | null;
  contentUri: string | null;
  status: string;
  sentAt: Date;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;
  dialog: EntityRelation<DialogWorkspaceEntity> | null;
  dialogId: string | null;
}
