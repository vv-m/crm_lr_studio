import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useCreateDefaultViewForObject } from '@/views/hooks/useCreateDefaultViewForObject';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useLayoutEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexViewLoadLayoutEffect = () => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const [loadedViewId, setLoadedViewId] = useState<string | undefined>(
    undefined,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { createDefaultViewForObject } = useCreateDefaultViewForObject();

  useLayoutEffect(() => {
    if (
      isDefined(contextStoreCurrentViewId) &&
      loadedViewId === contextStoreCurrentViewId
    ) {
      return;
    }

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    if (isDefined(view)) {
      loadRecordIndexStates(view, objectMetadataItem);
      setLoadedViewId(contextStoreCurrentViewId);
    } else if (!isDefined(contextStoreCurrentViewId)) {
      createDefaultViewForObject(objectMetadataItem);
    }
  }, [
    contextStoreCurrentViewId,
    loadRecordIndexStates,
    loadedViewId,
    objectMetadataItem,
    view,
    createDefaultViewForObject,
  ]);
};
