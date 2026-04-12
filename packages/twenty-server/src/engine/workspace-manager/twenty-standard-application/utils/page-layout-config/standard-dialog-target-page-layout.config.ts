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

const DIALOG_TARGET_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab22-4022-8022-d1a10622a001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac22-4022-8022-d1a10622a011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab22-4022-8022-d1a10622a002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac22-4022-8022-d1a10622a021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DIALOG_TARGET_PAGE_LAYOUT_CONFIG = {
  name: 'Default Dialog Target Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.dialogTarget.universalIdentifier,
  universalIdentifier: '20202020-a122-4022-8022-d1a10622a000',
  defaultTabUniversalIdentifier: null,
  tabs: DIALOG_TARGET_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
