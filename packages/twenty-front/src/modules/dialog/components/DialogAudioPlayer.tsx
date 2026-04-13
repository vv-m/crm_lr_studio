import { useCallback, useEffect, useRef, useState } from 'react';
import { styled } from '@linaria/react';
import { IconPlayerPause, IconPlayerPlay } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAudioContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 200px;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledPlayButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 0;
`;

const StyledProgressContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const StyledProgressBar = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  cursor: pointer;
  height: 4px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledProgressFill = styled.div<{ progress: number }>`
  background-color: ${themeCssVariables.font.color.primary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 100%;
  transition: width 0.1s linear;
  width: ${({ progress }) => progress}%;
`;

const StyledDuration = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

type DialogAudioPlayerProps = {
  src: string;
};

export const DialogAudioPlayer = ({ src }: DialogAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = new Audio(src);

    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;

      if (!audio || audio.duration === 0) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const clickPosition = (event.clientX - rect.left) / rect.width;

      audio.currentTime = clickPosition * audio.duration;
    },
    [],
  );

  const displayTime = isPlaying || currentTime > 0 ? currentTime : duration;

  return (
    <StyledAudioContainer>
      <StyledPlayButton onClick={togglePlay}>
        {isPlaying ? (
          <IconPlayerPause size={20} />
        ) : (
          <IconPlayerPlay size={20} />
        )}
      </StyledPlayButton>
      <StyledProgressContainer>
        <StyledProgressBar onClick={handleProgressClick}>
          <StyledProgressFill progress={progress} />
        </StyledProgressBar>
        {displayTime > 0 && (
          <StyledDuration>{formatTime(displayTime)}</StyledDuration>
        )}
      </StyledProgressContainer>
    </StyledAudioContainer>
  );
};
