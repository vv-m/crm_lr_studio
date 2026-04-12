import { useMemo } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type DialogTargetRecord = ObjectRecord & {
  dialogId: string | null;
  targetPersonId: string | null;
  targetCompanyId: string | null;
  targetOpportunityId: string | null;
  dialog: DialogRecord | null;
};

export type DialogRecord = ObjectRecord & {
  name: string;
  status: string;
  chatType: string;
  chatId: string;
  contactName: string | null;
  contactPhone: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
};

// Maps the record's objectNameSingular to the filter field on dialogTarget
const TARGET_FIELD_MAP: Record<string, string> = {
  person: 'targetPersonId',
  company: 'targetCompanyId',
  opportunity: 'targetOpportunityId',
};

type UseDialogsForRecordParams = {
  objectNameSingular: string;
  recordId: string;
};

export const useDialogsForRecord = ({
  objectNameSingular,
  recordId,
}: UseDialogsForRecordParams) => {
  const targetField = TARGET_FIELD_MAP[objectNameSingular];

  const filter = useMemo(() => {
    if (!targetField) {
      return undefined;
    }

    return {
      [targetField]: {
        eq: recordId,
      },
    };
  }, [targetField, recordId]);

  const { records: dialogTargets, loading } =
    useFindManyRecords<DialogTargetRecord>({
      objectNameSingular: CoreObjectNameSingular.DialogTarget,
      filter,
      skip: !targetField,
      recordGqlFields: {
        id: true,
        dialogId: true,
        dialog: {
          id: true,
          name: true,
          status: true,
          chatType: true,
          chatId: true,
          contactName: true,
          contactPhone: true,
          lastMessageAt: true,
          lastMessagePreview: true,
        },
      },
      orderBy: [{ createdAt: 'DescNullsLast' }],
    });

  const dialogs = useMemo(() => {
    return dialogTargets
      .map((dialogTarget) => dialogTarget.dialog)
      .filter(
        (dialog): dialog is DialogRecord => dialog !== null && dialog !== undefined,
      );
  }, [dialogTargets]);

  return {
    dialogs,
    loading,
  };
};
