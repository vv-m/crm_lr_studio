import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const resolveRecordIndexContextStoreViewType = ({
  view,
}: {
  view?: View;
}): ContextStoreViewType | null => {
  if (!isDefined(view)) {
    return null;
  }

  return view.type === ViewType.KANBAN
    ? ContextStoreViewType.Kanban
    : ContextStoreViewType.Table;
};
