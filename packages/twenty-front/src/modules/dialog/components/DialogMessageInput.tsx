import { useCallback, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconSend } from 'twenty-ui/display';

const StyledInputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  background-color: ${themeCssVariables.background.primary};
`;

const StyledTextarea = styled.textarea`
  flex: 1;
  resize: none;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: 8px 12px;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background-color: ${themeCssVariables.background.secondary};
  outline: none;
  min-height: 36px;
  max-height: 120px;
  overflow-y: auto;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:focus {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledSendButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  background-color: ${(props) =>
    props.disabled
      ? themeCssVariables.background.tertiary
      : themeCssVariables.color.blue};
  color: ${(props) =>
    props.disabled
      ? themeCssVariables.font.color.tertiary
      : '#ffffff'};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  flex-shrink: 0;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

type DialogMessageInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export const DialogMessageInput = ({
  onSend,
  disabled = false,
}: DialogMessageInputProps) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAutoGrow = useCallback(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSend(trimmed);
    setText('');

    // Reset textarea height
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const isDisabled = disabled || text.trim().length === 0;

  return (
    <StyledInputContainer>
      <StyledTextarea
        ref={textareaRef}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          handleAutoGrow();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
      />
      <StyledSendButton disabled={isDisabled} onClick={handleSend}>
        <IconSend size={18} />
      </StyledSendButton>
    </StyledInputContainer>
  );
};
