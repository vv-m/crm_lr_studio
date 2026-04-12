import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WazzupChannelWorkspaceEntity } from 'src/modules/wazzup/standard-objects/wazzup-channel.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { type ActorMetadata } from 'twenty-shared/types';

export class WazzupAccountWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  apiKey: string;
  webhookUrl: string | null;
  isActive: boolean;
  lastSyncAt: Date | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  searchVector: string;
  accountOwner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  accountOwnerId: string | null;
  wazzupChannels: EntityRelation<WazzupChannelWorkspaceEntity[]>;
}
