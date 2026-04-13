import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FileTypeParser, supportedMimeTypes } from 'file-type';
import { lookup } from 'mrmime';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { detectPdf } from '@file-type/pdf';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';

export const extractFileInfo = async ({
  file,
  filename,
}: {
  file: Buffer;
  filename: string;
}) => {
  const { ext: declaredExt } = buildFileInfo(filename);

  // Audio files recorded in-browser (webm, ogg) may be detected as
  // video/webm by file-type because Chrome uses WebM container for
  // audio. Trust the declared extension for known audio formats so
  // the file keeps its .ogg name (required by Wazzup for voice).
  const audioExtensions = new Set(['webm', 'ogg', 'opus', 'm4a', 'wav', 'mp3']);

  if (isNonEmptyString(declaredExt) && audioExtensions.has(declaredExt)) {
    const mimeTypeFromExtension =
      lookup(declaredExt) ?? 'application/octet-stream';

    return {
      mimeType: mimeTypeFromExtension,
      ext: declaredExt,
    };
  }

  const fileParser = new FileTypeParser({
    customDetectors: [detectPdf],
  });

  const { ext: detectedExt, mime: detectedMime } =
    (await fileParser.fromBuffer(file)) ?? {};

  if (isDefined(detectedExt) && isDefined(detectedMime)) {
    return {
      mimeType: detectedMime,
      ext: detectedExt,
    };
  }

  const ext = declaredExt;

  let mimeType: string = 'application/octet-stream';

  if (isNonEmptyString(ext)) {
    const mimeTypeFromExtension = lookup(ext);

    if (
      mimeTypeFromExtension &&
      supportedMimeTypes.has(mimeTypeFromExtension)
    ) {
      throw new FileStorageException(
        `File content does not match its extension. The file has extension '${ext}' (expected mime type: ${mimeTypeFromExtension}), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.`,
        FileStorageExceptionCode.INVALID_EXTENSION,
        {
          userFriendlyMessage: msg`The file extension doesn't match the file content. Please check that your file is not corrupted and has the correct extension.`,
        },
      );
    }

    mimeType = mimeTypeFromExtension ?? 'application/octet-stream';
  }

  return {
    mimeType,
    ext,
  };
};
