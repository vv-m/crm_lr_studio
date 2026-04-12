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

const DIALOG_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab20-4020-8020-d1a10620a001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac20-4020-8020-d1a10620a011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab20-4020-8020-d1a10620a002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac20-4020-8020-d1a10620a021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_DIALOG_PAGE_LAYOUT_CONFIG = {
  name: 'Default Dialog Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.dialog.universalIdentifier,
  universalIdentifier: '20202020-a120-4020-8020-d1a10620a000',
  defaultTabUniversalIdentifier: null,
  tabs: DIALOG_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
