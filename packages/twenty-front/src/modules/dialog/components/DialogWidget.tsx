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
  height: calc(100vh - 200px);
  min-height: 320px;
`;

const StyledListPanel = styled.div`
  flex-shrink: 0;
  min-width: 200px;
  overflow: hidden;
  width: 33%;
`;

const StyledThreadPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const StyledNoSelectionPlaceholder = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  padding: 48px 0;
`;

const StyledDirectThreadContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 320px;
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

  const isDialogRecord =
    targetRecord.targetObjectNameSingular === 'dialog';

  const { dialogs, loading } = useDialogsForRecord({
    objectNameSingular: targetRecord.targetObjectNameSingular,
    recordId: targetRecord.id,
  });

  // When we are on a Dialog record page, render thread directly
  if (isDialogRecord) {
    return (
      <StyledContainer>
        <StyledDirectThreadContainer>
          <DialogThread dialogId={targetRecord.id} />
        </StyledDirectThreadContainer>
      </StyledContainer>
    );
  }

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
