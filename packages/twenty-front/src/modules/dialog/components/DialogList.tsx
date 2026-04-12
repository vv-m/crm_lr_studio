import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconMessage } from 'twenty-ui/display';

import { DialogStatusBadge } from '@/dialog/components/DialogStatusBadge';
import { type DialogRecord } from '@/dialog/hooks/useDialogsForRecord';

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  height: 100%;
`;

const StyledDialogItem = styled.div<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  background-color: ${(props) =>
    props.isSelected
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.primary};

  &:hover {
    background-color: ${themeCssVariables.background.secondary};
  }
`;

const StyledDialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StyledContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const StyledContactName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledChatTypeIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledPreviewRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StyledMessagePreview = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const StyledTimestamp = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  white-space: nowrap;
  flex-shrink: 0;
`;

const formatTimestamp = (timestamp: string | null): string => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
};

// Simple chat type icon - uses generic message icon since brand icons
// for Telegram/WhatsApp are not exported from twenty-ui
const ChatTypeIcon = ({ chatType: _chatType }: { chatType: string }) => {
  return <IconMessage size={16} />;
};

type DialogListProps = {
  dialogs: DialogRecord[];
  selectedDialogId: string | undefined;
  onSelectDialog: (dialogId: string) => void;
};

export const DialogList = ({
  dialogs,
  selectedDialogId,
  onSelectDialog,
}: DialogListProps) => {
  return (
    <StyledListContainer>
      {dialogs.map((dialog) => (
        <StyledDialogItem
          key={dialog.id}
          isSelected={dialog.id === selectedDialogId}
          onClick={() => onSelectDialog(dialog.id)}
        >
          <StyledDialogHeader>
            <StyledContactInfo>
              <StyledChatTypeIcon>
                <ChatTypeIcon chatType={dialog.chatType} />
              </StyledChatTypeIcon>
              <StyledContactName>
                {dialog.contactName ?? dialog.name}
              </StyledContactName>
            </StyledContactInfo>
            <DialogStatusBadge status={dialog.status} />
          </StyledDialogHeader>
          <StyledPreviewRow>
            <StyledMessagePreview>
              {dialog.lastMessagePreview ?? ''}
            </StyledMessagePreview>
            <StyledTimestamp>
              {formatTimestamp(dialog.lastMessageAt)}
            </StyledTimestamp>
          </StyledPreviewRow>
        </StyledDialogItem>
      ))}
    </StyledListContainer>
  );
};
