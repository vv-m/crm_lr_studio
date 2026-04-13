import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { IconPlayerStop, IconX } from 'twenty-ui/display';
import { IconButton, RoundedIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecorderContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledRecordingIndicator = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRedDot = styled.div`
  animation: pulse 1.2s ease-in-out infinite;
  background-color: ${themeCssVariables.color.red};
  border-radius: 50%;
  flex-shrink: 0;
  height: 10px;
  width: 10px;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
`;

const StyledTimer = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-variant-numeric: tabular-nums;
`;

const formatRecordingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type DialogAudioRecorderProps = {
  onComplete: (audioFile: File) => void;
  onCancel: () => void;
};

export const DialogAudioRecorder = ({
  onComplete,
  onCancel,
}: DialogAudioRecorderProps) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const handleCancel = useCallback(() => {
    stopRecording();
    chunksRef.current = [];
    onCancel();
  }, [stopRecording, onCancel]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startRecording = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Wazzup sends .ogg and .mp3 under 1MB as voice messages
        // in Telegram. Record as ogg if possible, else webm (opus
        // codec in both), and always save with .ogg extension.
        const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : 'audio/webm;codecs=opus';

        const recorder = new MediaRecorder(stream, { mimeType });

        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, {
              type: 'audio/ogg',
            });
            const fileName = `voice_${Date.now()}.ogg`;
            const file = new File([blob], fileName, { type: 'audio/ogg' });

            onComplete(file);
          }

          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        };

        recorder.start();

        timerIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch {
        onCancel();
      }
    };

    startRecording();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledRecorderContainer>
      <IconButton
        variant="tertiary"
        size="small"
        onClick={handleCancel}
        Icon={IconX}
        ariaLabel="Cancel recording"
      />
      <StyledRecordingIndicator>
        <StyledRedDot />
        <StyledTimer>{formatRecordingTime(recordingTime)}</StyledTimer>
      </StyledRecordingIndicator>
      <RoundedIconButton
        Icon={IconPlayerStop}
        size="medium"
        onClick={handleStop}
      />
    </StyledRecorderContainer>
  );
};
