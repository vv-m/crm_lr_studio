import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('ConvertAudioToMp3');

// Convert any audio buffer to MP3 format using ffmpeg.
// Returns the converted buffer, or the original if ffmpeg fails.
export const convertAudioToMp3 = (input: Buffer): Buffer => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const inputPath = join(tmpdir(), `audio_in_${id}.webm`);
  const outputPath = join(tmpdir(), `audio_out_${id}.mp3`);

  try {
    writeFileSync(inputPath, input);

    execSync(
      `ffmpeg -y -i "${inputPath}" -c:a libmp3lame -b:a 64k "${outputPath}" 2>/dev/null`,
      { timeout: 15000 },
    );

    if (existsSync(outputPath)) {
      const converted = readFileSync(outputPath);

      logger.log(
        `Audio converted: ${input.length} bytes → ${converted.length} bytes`,
      );

      return converted;
    }
  } catch (error) {
    logger.warn(`ffmpeg conversion failed, using original: ${error}`);
  } finally {
    try {
      if (existsSync(inputPath)) unlinkSync(inputPath);
      if (existsSync(outputPath)) unlinkSync(outputPath);
    } catch {
      // cleanup best-effort
    }
  }

  return input;
};
