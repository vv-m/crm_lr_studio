import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardWazzupChannelViews = (
  args: Omit<CreateStandardViewArgs<'wazzupChannel'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allWazzupChannels: createStandardViewFlatMetadata({
      ...args,
      objectName: 'wazzupChannel',
      context: {
        viewName: 'allWazzupChannels',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
