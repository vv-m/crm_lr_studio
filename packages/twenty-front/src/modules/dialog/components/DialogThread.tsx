import { useCallback, useEffect, useRef } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DialogMessageBubble } from '@/dialog/components/DialogMessageBubble';
import { DialogMessageInput } from '@/dialog/components/DialogMessageInput';
import { useDialogMessages } from '@/dialog/hooks/useDialogMessages';
import { useSendDialogMessage } from '@/dialog/hooks/useSendDialogMessage';
import { useUploadDialogFile } from '@/dialog/hooks/useUploadDialogFile';

// Matches AIChatTab StyledContainer
const StyledContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// Matches AIChatTabMessageList StyledScrollWrapperContainer
const StyledMessagesContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
  position: relative;
`;

const StyledMessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: auto;
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

type DialogThreadProps = {
  dialogId: string;
};

export const DialogThread = ({ dialogId }: DialogThreadProps) => {
  const { t } = useLingui();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, refetch } = useDialogMessages({ dialogId });
  const { sendMessage, loading: sending } = useSendDialogMessage();
  const { uploadFile } = useUploadDialogFile();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadFile(file);

          if (uploaded) {
            const mimeType = file.type.split('/')[0];
            const wazzupType =
              mimeType === 'image'
                ? 'image'
                : mimeType === 'video'
                  ? 'video'
                  : 'file';

            await sendMessage({
              dialogId,
              contentUri: uploaded.url,
              messageType: wazzupType,
            });
          }
        }
      }

      if (text) {
        await sendMessage({ dialogId, text });
      }

      refetch();
    },
    [dialogId, sendMessage, uploadFile, refetch],
  );

  if (loading && messages.length === 0) {
    return (
      <StyledContainer>
        <StyledEmptyState>{t`Loading messages...`}</StyledEmptyState>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledMessagesContainer>
        {messages.length === 0 ? (
          <StyledEmptyState>{t`No messages in this dialog yet`}</StyledEmptyState>
        ) : (
          <StyledMessagesList>
            {messages.map((message) => (
              <DialogMessageBubble key={message.id} message={message} />
            ))}
          </StyledMessagesList>
        )}
        <div ref={messagesEndRef} />
      </StyledMessagesContainer>
      <DialogMessageInput onSend={handleSend} disabled={sending} />
    </StyledContainer>
  );
};
