import { useEffect, useMemo, useRef } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export type DialogMessageRecord = ObjectRecord & {
  name: string;
  externalMessageId: string | null;
  direction: string;
  messageType: string;
  text: string | null;
  contentUri: string | null;
  status: string;
  sentAt: string;
  dialogId: string | null;
};

const POLL_INTERVAL_MS = 5000;

type UseDialogMessagesParams = {
  dialogId: string | undefined;
};

export const useDialogMessages = ({ dialogId }: UseDialogMessagesParams) => {
  const { records, loading, refetch } =
    useFindManyRecords<DialogMessageRecord>({
      objectNameSingular: CoreObjectNameSingular.DialogMessage,
      filter: dialogId
        ? {
            dialogId: {
              eq: dialogId,
            },
          }
        : undefined,
      orderBy: [{ sentAt: 'AscNullsLast' }],
      skip: !dialogId,
      recordGqlFields: {
        id: true,
        name: true,
        externalMessageId: true,
        direction: true,
        messageType: true,
        text: true,
        contentUri: true,
        status: true,
        sentAt: true,
        dialogId: true,
      },
    });

  // Polling for real-time updates
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!dialogId) {
      return;
    }

    intervalRef.current = setInterval(() => {
      refetch();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dialogId, refetch]);

  const messages = useMemo(() => {
    return [...records].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
    );
  }, [records]);

  return {
    messages,
    loading,
    refetch,
  };
};
