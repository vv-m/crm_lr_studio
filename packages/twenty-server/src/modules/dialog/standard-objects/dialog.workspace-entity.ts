import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { type DialogMessageWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-message.workspace-entity';
import { type DialogTargetWorkspaceEntity } from 'src/modules/dialog/standard-objects/dialog-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type ActorMetadata } from 'twenty-shared/types';

export class DialogWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  status: string;
  chatType: string;
  chatId: string;
  contactName: string | null;
  contactPhone: string | null;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;
  wazzupChannel: EntityRelation<WazzupChannelWorkspaceEntity> | null;
  wazzupChannelId: string | null;
  dialogMessages: EntityRelation<DialogMessageWorkspaceEntity[]>;
  dialogTargets: EntityRelation<DialogTargetWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
}
