import { useCallback, useEffect, useRef } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { DialogMessageBubble } from '@/dialog/components/DialogMessageBubble';
import { DialogMessageInput } from '@/dialog/components/DialogMessageInput';
import { useDialogMessages } from '@/dialog/hooks/useDialogMessages';
import { useSendDialogMessage } from '@/dialog/hooks/useSendDialogMessage';
import { useUploadDialogFile } from '@/dialog/hooks/useUploadDialogFile';

const StyledThreadContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledMessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledEmptyThread = styled.div`
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
  flex: 1;
  color: ${themeCssVariables.font.color.tertiary};
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      // Wazzup API does not allow text and contentUri simultaneously,
      // so we send each file as a separate file-only message, then
      // send text as a separate text-only message.
      if (files && files.length > 0) {
        for (const file of files) {
          const uploaded = await uploadFile(file);

          if (uploaded) {
            const mimeType = file.type.split('/')[0];
            const wazzupType = mimeType === 'image'
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
      <StyledThreadContainer>
        <StyledLoadingContainer>{t`Loading messages...`}</StyledLoadingContainer>
      </StyledThreadContainer>
    );
  }

  return (
    <StyledThreadContainer>
      <StyledMessagesContainer>
        {messages.length === 0 ? (
          <StyledEmptyThread>{t`No messages in this dialog yet`}</StyledEmptyThread>
        ) : (
          messages.map((message) => (
            <DialogMessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </StyledMessagesContainer>
      <DialogMessageInput onSend={handleSend} disabled={sending} />
    </StyledThreadContainer>
  );
};
