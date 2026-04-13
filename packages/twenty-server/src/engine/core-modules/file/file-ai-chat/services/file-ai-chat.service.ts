import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { convertAudioToMp3 } from 'src/modules/wazzup/utils/convert-audio-to-mp3';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
const AUDIO_EXTENSIONS = new Set(['webm', 'ogg', 'opus', 'm4a', 'wav']);

@Injectable()
export class FileAIChatService {
  private readonly logger = new Logger(FileAIChatService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
  }): Promise<FileWithSignedUrlDTO> {
    let { mimeType, ext } = await extractFileInfo({
      file,
      filename,
    });

    // Convert audio files to proper OGG Opus via ffmpeg so
    // Wazzup sends them as voice messages in Telegram.
    let processedFile = file;

    if (isNonEmptyString(ext) && AUDIO_EXTENSIONS.has(ext)) {
      try {
        processedFile = convertAudioToMp3(file);
        ext = 'mp3';
        mimeType = 'audio/mpeg';
        this.logger.log(
          `Audio converted: ${file.length}b → ${processedFile.length}b`,
        );
      } catch {
        this.logger.warn('Audio conversion failed, using original');
      }
    }

    const sanitizedFile = sanitizeFile({ file: processedFile, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: name,
      mimeType,
      fileFolder: FileFolder.AgentChat,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    return {
      ...savedFile,
      url: this.fileUrlService.signFileByIdUrl({
        fileId,
        workspaceId,
        fileFolder: FileFolder.AgentChat,
      }),
    };
  }
}
