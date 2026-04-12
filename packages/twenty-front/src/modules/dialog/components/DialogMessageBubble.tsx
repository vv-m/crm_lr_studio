import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconCheck, IconFile } from 'twenty-ui/display';
import { type DialogMessageRecord } from '@/dialog/hooks/useDialogMessages';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledMessageBubble = styled.div<{ isOutbound: boolean }>`
  align-items: ${({ isOutbound }) => (isOutbound ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

const StyledMessageText = styled.div<{ isOutbound: boolean }>`
  background: ${({ isOutbound }) =>
    isOutbound
      ? themeCssVariables.color.sky4
      : themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isOutbound }) =>
    isOutbound
      ? themeCssVariables.color.sky12
      : themeCssVariables.font.color.primary};
  font-weight: ${({ isOutbound }) => (isOutbound ? 500 : 400)};
  line-height: 1.4em;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
  width: fit-content;
  word-wrap: break-word;
`;

const StyledMessageContainer = styled.div`
  max-width: 100%;
  min-width: 0;
  width: fit-content;
`;

const StyledTimestamp = styled.span<{ isOutbound: boolean }>`
  align-items: center;
  color: ${({ isOutbound }) =>
    isOutbound
      ? themeCssVariables.color.sky11
      : themeCssVariables.font.color.light};
  display: flex;
  float: right;
  font-size: ${themeCssVariables.font.size.xs};
  gap: 2px;
  margin-left: ${themeCssVariables.spacing[2]};
  margin-top: 2px;
`;

const StyledMediaPreview = styled.div`
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledImage = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  max-height: 180px;
  max-width: 240px;
  object-fit: cover;
`;

const StyledVideo = styled.video`
  border-radius: ${themeCssVariables.border.radius.sm};
  max-height: 180px;
  max-width: 240px;
`;

const StyledFileLink = styled.a`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  text-decoration: none;

  &:hover {
    background-color: ${themeCssVariables.background.quaternary};
  }
`;

// Convert absolute server URLs to local base URL for direct access
const toDisplayUri = (uri: string): string => {
  try {
    const parsed = new URL(uri);
    const localBase = REACT_APP_SERVER_BASE_URL ?? '';

    if (parsed.pathname.startsWith('/file/') && localBase) {
      return `${localBase}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Not a valid URL
  }

  return uri;
};

const isImageContent = (uri: string, messageType?: string): boolean => {
  if (messageType === 'image') {
    return true;
  }

  const lower = uri.toLowerCase();

  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.includes('image')
  );
};

const isVideoContent = (uri: string, messageType?: string): boolean => {
  if (messageType === 'video') {
    return true;
  }

  const lower = uri.toLowerCase();

  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.avi')
  );
};

const formatMessageTime = (sentAt: string): string => {
  const date = new Date(sentAt);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

type DialogMessageBubbleProps = {
  message: DialogMessageRecord;
};

export const DialogMessageBubble = ({ message }: DialogMessageBubbleProps) => {
  const isOutbound = message.direction?.toUpperCase() === 'OUTBOUND';

  return (
    <StyledMessageBubble isOutbound={isOutbound}>
      <StyledMessageContainer>
        <StyledMessageText isOutbound={isOutbound}>
          {message.contentUri && (
            <StyledMediaPreview>
              {isImageContent(message.contentUri, message.messageType) ? (
                <StyledImage
                  src={toDisplayUri(message.contentUri)}
                  alt="Media"
                  onClick={() =>
                    window.open(
                      toDisplayUri(message.contentUri ?? ''),
                      '_blank',
                    )
                  }
                />
              ) : isVideoContent(message.contentUri, message.messageType) ? (
                <StyledVideo controls>
                  <source src={toDisplayUri(message.contentUri)} />
                </StyledVideo>
              ) : (
                <StyledFileLink
                  href={toDisplayUri(message.contentUri)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconFile size={16} />
                  Document
                </StyledFileLink>
              )}
            </StyledMediaPreview>
          )}
          {message.text}
          <StyledTimestamp isOutbound={isOutbound}>
            {formatMessageTime(message.sentAt)}
            {isOutbound && <IconCheck size={12} />}
          </StyledTimestamp>
        </StyledMessageText>
      </StyledMessageContainer>
    </StyledMessageBubble>
  );
};
