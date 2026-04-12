import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const WAZZUP_CHANNEL_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab24-4024-8024-d1a10624a001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac24-4024-8024-d1a10624a011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab24-4024-8024-d1a10624a002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac24-4024-8024-d1a10624a021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WAZZUP_CHANNEL_PAGE_LAYOUT_CONFIG = {
  name: 'Default Wazzup Channel Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.wazzupChannel.universalIdentifier,
  universalIdentifier: '20202020-a124-4024-8024-d1a10624a000',
  defaultTabUniversalIdentifier: null,
  tabs: WAZZUP_CHANNEL_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
