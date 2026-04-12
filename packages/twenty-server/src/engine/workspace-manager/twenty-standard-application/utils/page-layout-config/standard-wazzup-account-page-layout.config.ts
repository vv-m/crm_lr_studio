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

const WAZZUP_ACCOUNT_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab23-4023-8023-d1a10623a001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac23-4023-8023-d1a10623a011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab23-4023-8023-d1a10623a002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac23-4023-8023-d1a10623a021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WAZZUP_ACCOUNT_PAGE_LAYOUT_CONFIG = {
  name: 'Default Wazzup Account Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.wazzupAccount.universalIdentifier,
  universalIdentifier: '20202020-a123-4023-8023-d1a10623a000',
  defaultTabUniversalIdentifier: null,
  tabs: WAZZUP_ACCOUNT_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
