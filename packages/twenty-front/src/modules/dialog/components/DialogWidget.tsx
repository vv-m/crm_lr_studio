import { useState } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

import { DialogEmptyState } from '@/dialog/components/DialogEmptyState';
import { DialogList } from '@/dialog/components/DialogList';
import { DialogThread } from '@/dialog/components/DialogThread';
import { useDialogsForRecord } from '@/dialog/hooks/useDialogsForRecord';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledSplitLayout = styled.div`
  display: flex;
  height: 480px;
  min-height: 0;
`;

const StyledListPanel = styled.div`
  width: 33%;
  min-width: 200px;
  flex-shrink: 0;
  overflow: hidden;
`;

const StyledThreadPanel = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const StyledNoSelectionPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: ${themeCssVariables.font.color.tertiary};
`;

type DialogWidgetProps = {
  widget: PageLayoutWidget;
};

export const DialogWidget = ({ widget: _widget }: DialogWidgetProps) => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const [selectedDialogId, setSelectedDialogId] = useState<
    string | undefined
  >();

  const { dialogs, loading } = useDialogsForRecord({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    recordId: targetRecord.id,
  });

  if (loading) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>{t`Loading dialogs...`}</StyledLoadingContainer>
      </StyledContainer>
    );
  }

  if (dialogs.length === 0) {
    return (
      <StyledContainer>
        <DialogEmptyState />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledSplitLayout>
        <StyledListPanel>
          <DialogList
            dialogs={dialogs}
            selectedDialogId={selectedDialogId}
            onSelectDialog={setSelectedDialogId}
          />
        </StyledListPanel>
        <StyledThreadPanel>
          {selectedDialogId ? (
            <DialogThread dialogId={selectedDialogId} />
          ) : (
            <StyledNoSelectionPlaceholder>
              {t`Select a dialog to view messages`}
            </StyledNoSelectionPlaceholder>
          )}
        </StyledThreadPanel>
      </StyledSplitLayout>
    </StyledContainer>
  );
};
