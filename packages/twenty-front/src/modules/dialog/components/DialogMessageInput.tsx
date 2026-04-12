import { useCallback, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { IconPaperclip, IconArrowUp, IconX } from 'twenty-ui/display';
import { IconButton, RoundedIconButton } from 'twenty-ui/input';
import { isDefined } from 'twenty-shared/utils';

const StyledInputArea = styled.div`
  align-items: flex-end;
  background: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  padding-block: ${themeCssVariables.spacing[3]};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledInputBox = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
    box-shadow: 0px 0px 0px 3px ${themeCssVariables.color.transparent.blue2};
  }
`;

const StyledTextarea = styled.textarea`
  background: transparent;
  border: none;
  box-shadow: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 16px;
  max-height: 320px;
  min-height: 48px;
  outline: none;
  overflow-y: auto;
  padding: 0;
  resize: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.regular};
  }
`;

const StyledButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledLeftButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledRightButtonsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledPreviewRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPreviewItem = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  flex-shrink: 0;
  height: 64px;
  overflow: hidden;
  position: relative;
  width: 64px;
`;

const StyledPreviewImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledPreviewFile = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: 10px;
  height: 100%;
  justify-content: center;
  padding: 4px;
  text-align: center;
  width: 100%;
  word-break: break-all;
`;

const StyledRemoveButton = styled.button`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.dark};
  border: none;
  border-radius: 50%;
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  display: flex;
  height: 18px;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 2px;
  top: 2px;
  width: 18px;
  z-index: 2;
`;

const StyledDropOverlay = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.blue};
  border: 2px dashed ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 10;
`;

const StyledDropZoneWrapper = styled.div`
  position: relative;
`;

const isImageFile = (file: File): boolean => file.type.startsWith('image/');

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
  const [dragCounter, setDragCounter] = useState(0);

  const addFiles = useCallback((files: FileList | File[]) => {
    setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
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

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = event.clipboardData?.items;

      if (!isDefined(items)) {
        return;
      }

      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === 'file') {
          const file = item.getAsFile();

          if (isDefined(file)) {
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

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const newCount = dragCounter + 1;

      setDragCounter(newCount);

      if (event.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    },
    [dragCounter],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const newCount = dragCounter - 1;

      setDragCounter(newCount);

      if (newCount === 0) {
        setIsDragging(false);
      }
    },
    [dragCounter],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragCounter(0);
      setIsDragging(false);

      const droppedFiles = event.dataTransfer.files;

      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles],
  );

  const isDisabled =
    disabled || (text.trim().length === 0 && attachedFiles.length === 0);

  return (
    <StyledDropZoneWrapper
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && <StyledDropOverlay>Drop files here</StyledDropOverlay>}
      <StyledInputArea>
        <StyledInputBox>
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
          <StyledTextarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a message..."
            rows={1}
          />
          <StyledButtonsContainer>
            <StyledLeftButtonsContainer>
              <StyledFileInput
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                onChange={(event) => {
                  if (
                    isDefined(event.target.files) &&
                    event.target.files.length > 0
                  ) {
                    addFiles(event.target.files);
                  }

                  event.target.value = '';
                }}
              />
              <IconButton
                variant="tertiary"
                size="small"
                onClick={() => fileInputRef.current?.click()}
                Icon={IconPaperclip}
                ariaLabel="Attach files"
              />
            </StyledLeftButtonsContainer>
            <StyledRightButtonsContainer>
              <RoundedIconButton
                Icon={IconArrowUp}
                size="medium"
                onClick={handleSend}
                disabled={isDisabled}
              />
            </StyledRightButtonsContainer>
          </StyledButtonsContainer>
        </StyledInputBox>
      </StyledInputArea>
    </StyledDropZoneWrapper>
  );
};
