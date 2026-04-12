import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardDialogTargetViews = (
  args: Omit<CreateStandardViewArgs<'dialogTarget'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allDialogTargets: createStandardViewFlatMetadata({
      ...args,
      objectName: 'dialogTarget',
      context: {
        viewName: 'allDialogTargets',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
