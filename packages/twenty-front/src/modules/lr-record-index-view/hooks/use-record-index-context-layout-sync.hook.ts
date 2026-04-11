import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getViewType } from '@/context-store/utils/getViewType';
import { type View } from '@/views/types/View';
import { useLayoutEffect } from 'react';

type UseRecordIndexContextLayoutSyncParams = {
  isSettingsPage: boolean;
  isRecordShowPage: boolean;
  isRecordIndexPage: boolean;
  view: View | undefined;
  viewId: string | undefined;
  contextStoreCurrentViewId: string | undefined;
  setContextStoreCurrentViewId: (value: string | undefined) => void;
  contextStoreCurrentViewType: ContextStoreViewType | null;
  setContextStoreCurrentViewType: (
    value: ContextStoreViewType | null,
  ) => void;
};

export const useRecordIndexContextLayoutSync = ({
  isSettingsPage,
  isRecordShowPage,
  isRecordIndexPage,
  view,
  viewId,
  contextStoreCurrentViewId,
  setContextStoreCurrentViewId,
  contextStoreCurrentViewType,
  setContextStoreCurrentViewType,
}: UseRecordIndexContextLayoutSyncParams) => {
  useLayoutEffect(() => {
    if (isSettingsPage) {
      setContextStoreCurrentViewId(undefined);
      return;
    }

    if (contextStoreCurrentViewId !== viewId) {
      setContextStoreCurrentViewId(viewId);
    }
  }, [
    contextStoreCurrentViewId,
    isSettingsPage,
    setContextStoreCurrentViewId,
    viewId,
  ]);

  useLayoutEffect(() => {
    const viewType = getViewType({
      isSettingsPage,
      isRecordShowPage,
      isRecordIndexPage,
      view,
    });

    if (contextStoreCurrentViewType !== viewType) {
      setContextStoreCurrentViewType(viewType);
    }
  }, [
    contextStoreCurrentViewType,
    setContextStoreCurrentViewType,
    view,
    isSettingsPage,
    isRecordShowPage,
    isRecordIndexPage,
  ]);
};
