import { useCallback, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconPaperclip, IconSend, IconX } from 'twenty-ui/display';

const StyledWrapper = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  background-color: ${themeCssVariables.background.primary};
`;

const StyledDropZone = styled.div<{ isDragging: boolean }>`
  position: relative;
  ${(props) =>
    props.isDragging
      ? `
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px dashed ${themeCssVariables.color.blue};
      border-radius: ${themeCssVariables.border.radius.md};
      background-color: ${themeCssVariables.background.transparent.blue};
      pointer-events: none;
      z-index: 1;
    }
  `
      : ''}
`;

const StyledPreviewRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 16px 0;
  flex-wrap: wrap;
`;

const StyledPreviewItem = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: ${themeCssVariables.border.radius.sm};
  overflow: hidden;
  border: 1px solid ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
`;

const StyledPreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyledPreviewFile = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${themeCssVariables.background.tertiary};
  font-size: 10px;
  color: ${themeCssVariables.font.color.secondary};
  text-align: center;
  padding: 4px;
  word-break: break-all;
`;

const StyledRemoveButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  z-index: 2;
`;

const StyledInputContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
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

const StyledIconButton = styled.button<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  background-color: transparent;
  color: ${(props) =>
    props.disabled
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.secondary};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  flex-shrink: 0;
  transition: color 0.15s ease;

  &:hover:not(:disabled) {
    color: ${themeCssVariables.font.color.primary};
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
    props.disabled ? themeCssVariables.font.color.tertiary : '#ffffff'};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  flex-shrink: 0;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

const isImageFile = (file: File): boolean =>
  file.type.startsWith('image/');

type DialogMessageInputProps = {
  onSend: (text: string, files?: File[]) => void;
  disabled?: boolean;
};

export const DialogMessageInput = ({
  onSend,
  disabled = false,
}: DialogMessageInputProps) => {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleAutoGrow = useCallback(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);

    setAttachedFiles((prev) => [...prev, ...fileArray]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    const hasFiles = attachedFiles.length > 0;

    if ((!trimmed && !hasFiles) || disabled) {
      return;
    }

    onSend(trimmed, hasFiles ? attachedFiles : undefined);
    setText('');
    setAttachedFiles([]);

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
    }
  }, [text, attachedFiles, disabled, onSend]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Paste from clipboard
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items;

      if (!items) {
        return;
      }

      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === 'file') {
          const file = item.getAsFile();

          if (file) {
            pastedFiles.push(file);
          }
        }
      }

      if (pastedFiles.length > 0) {
        event.preventDefault();
        addFiles(pastedFiles);
      }
    },
    [addFiles],
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current += 1;

      if (event.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    },
    [],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current -= 1;

      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    [],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const droppedFiles = event.dataTransfer.files;

      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;

      if (selectedFiles && selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }

      // Reset input so the same file can be selected again
      event.target.value = '';
    },
    [addFiles],
  );

  const isDisabled =
    disabled || (text.trim().length === 0 && attachedFiles.length === 0);

  return (
    <StyledDropZone
      isDragging={isDragging}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <StyledWrapper>
        {attachedFiles.length > 0 && (
          <StyledPreviewRow>
            {attachedFiles.map((file, index) => (
              <StyledPreviewItem key={`${file.name}-${index}`}>
                {isImageFile(file) ? (
                  <StyledPreviewImage
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                  />
                ) : (
                  <StyledPreviewFile>{file.name}</StyledPreviewFile>
                )}
                <StyledRemoveButton onClick={() => removeFile(index)}>
                  <IconX size={10} />
                </StyledRemoveButton>
              </StyledPreviewItem>
            ))}
          </StyledPreviewRow>
        )}
        <StyledInputContainer>
          <StyledIconButton disabled={disabled} onClick={handleAttachClick}>
            <IconPaperclip size={18} />
          </StyledIconButton>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
          <StyledTextarea
            ref={textareaRef}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              handleAutoGrow();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            rows={1}
          />
          <StyledSendButton disabled={isDisabled} onClick={handleSend}>
            <IconSend size={18} />
          </StyledSendButton>
        </StyledInputContainer>
      </StyledWrapper>
    </StyledDropZone>
  );
};
