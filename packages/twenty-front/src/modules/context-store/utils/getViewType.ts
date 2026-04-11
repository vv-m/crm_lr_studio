import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { resolveRecordIndexContextStoreViewType } from '@/lr-record-index-view/utils/resolve-record-index-context-store-view-type.util';
import { type View } from '@/views/types/View';

export const getViewType = ({
  isSettingsPage,
  isRecordShowPage,
  isRecordIndexPage,
  view,
}: {
  isSettingsPage: boolean;
  isRecordShowPage: boolean;
  isRecordIndexPage: boolean;
  view?: View;
}) => {
  if (isSettingsPage) {
    return null;
  }

  if (isRecordIndexPage) {
    return resolveRecordIndexContextStoreViewType({ view });
  }

  if (isRecordShowPage) {
    return ContextStoreViewType.ShowPage;
  }

  return null;
};
