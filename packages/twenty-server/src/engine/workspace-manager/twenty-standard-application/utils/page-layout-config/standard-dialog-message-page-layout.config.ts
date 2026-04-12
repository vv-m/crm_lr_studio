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

const DIALOG_MESSAGE_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab21-4021-8021-d1a10621a001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac21-4021-8021-d1a10621a011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab21-4021-8021-d1a10621a002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac21-4021-8021-d1a10621a021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DIALOG_MESSAGE_PAGE_LAYOUT_CONFIG = {
  name: 'Default Dialog Message Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.dialogMessage.universalIdentifier,
  universalIdentifier: '20202020-a121-4021-8021-d1a10621a000',
  defaultTabUniversalIdentifier: null,
  tabs: DIALOG_MESSAGE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
