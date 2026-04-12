import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconCheck, IconFile } from 'twenty-ui/display';

import { type DialogMessageRecord } from '@/dialog/hooks/useDialogMessages';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const StyledBubbleRow = styled.div<{ isOutbound: boolean }>`
  display: flex;
  justify-content: ${(props) =>
    props.isOutbound ? 'flex-end' : 'flex-start'};
  padding: 2px 16px;
`;

const StyledBubble = styled.div<{ isOutbound: boolean }>`
  max-width: 70%;
  padding: 8px 12px;
  border-radius: ${themeCssVariables.border.radius.md};
  background-color: ${(props) =>
    props.isOutbound
      ? themeCssVariables.color.blue
      : themeCssVariables.background.secondary};
  color: ${(props) =>
    props.isOutbound ? '#ffffff' : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const StyledMediaPreview = styled.div`
  margin-bottom: 4px;
`;

const StyledImage = styled.img`
  max-width: 240px;
  max-height: 180px;
  border-radius: ${themeCssVariables.border.radius.sm};
  object-fit: cover;
  cursor: pointer;
`;

const StyledVideo = styled.video`
  max-width: 240px;
  max-height: 180px;
  border-radius: ${themeCssVariables.border.radius.sm};
`;

const StyledFileLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${themeCssVariables.border.radius.sm};
  background-color: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.primary};
  text-decoration: none;
  font-size: ${themeCssVariables.font.size.sm};

  &:hover {
    background-color: ${themeCssVariables.background.quaternary};
  }
`;

const StyledMeta = styled.div<{ isOutbound: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) =>
    props.isOutbound ? 'flex-end' : 'flex-start'};
  gap: 4px;
  margin-top: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  color: ${(props) =>
    props.isOutbound
      ? 'rgba(255, 255, 255, 0.7)'
      : themeCssVariables.font.color.tertiary};
`;

// Convert absolute server URLs to local base URL for direct access.
// Files uploaded via our server get a SERVER_URL-based URL (e.g. ngrok)
// which may be inaccessible from the browser. We replace the origin
// with the local REACT_APP_SERVER_BASE_URL to load them directly.
const toDisplayUri = (uri: string): string => {
  try {
    const parsed = new URL(uri);
    const localBase = REACT_APP_SERVER_BASE_URL ?? '';

    // Only rewrite if the path looks like our own file endpoint
    if (parsed.pathname.startsWith('/file/') && localBase) {
      return `${localBase}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Not a valid URL — return as is
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

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'read') {
    return <IconCheck size={14} />;
  }

  if (status === 'delivered') {
    return <IconCheck size={14} />;
  }

  return <IconCheck size={14} />;
};

type DialogMessageBubbleProps = {
  message: DialogMessageRecord;
};

export const DialogMessageBubble = ({ message }: DialogMessageBubbleProps) => {
  const isOutbound = message.direction?.toUpperCase() === 'OUTBOUND';

  return (
    <StyledBubbleRow isOutbound={isOutbound}>
      <StyledBubble isOutbound={isOutbound}>
        {message.contentUri && (
          <StyledMediaPreview>
            {isImageContent(message.contentUri, message.messageType) ? (
              <StyledImage
                src={toDisplayUri(message.contentUri)}
                alt="Media"
                onClick={() =>
                  window.open(toDisplayUri(message.contentUri ?? ''), '_blank')
                }
              />
            ) : isVideoContent(
                message.contentUri,
                message.messageType,
              ) ? (
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
        <StyledMeta isOutbound={isOutbound}>
          <span>{formatMessageTime(message.sentAt)}</span>
          {isOutbound && <StatusIcon status={message.status} />}
        </StyledMeta>
      </StyledBubble>
    </StyledBubbleRow>
  );
};
