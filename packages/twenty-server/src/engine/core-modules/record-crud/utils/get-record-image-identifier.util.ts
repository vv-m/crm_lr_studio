import { isNonEmptyString } from '@sniptt/guards';
import { getLogoUrlFromDomainName, isDefined } from 'twenty-shared/utils';

import { FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FileFolder } from 'twenty-shared/types';

type GetRecordImageIdentifierOptions = {
  record: Record<string, unknown>;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  signUrl?: (fileId: string, fileFolder: FileFolder) => string | null;
};

export const getRecordImageIdentifier = ({
  record,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  signUrl,
}: GetRecordImageIdentifierOptions): string | null => {
  // Explicit per-object image identifier wins over built-in fallbacks.
  if (isDefined(flatObjectMetadata.imageIdentifierFieldMetadataId)) {
    const imageIdentifierField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: flatObjectMetadata.imageIdentifierFieldMetadataId,
    });

    if (isDefined(imageIdentifierField)) {
      const imageValue = record[imageIdentifierField.name];

      // FILES field: resolve the first uploaded file via signUrl.
      if (Array.isArray(imageValue)) {
        const firstFile = imageValue[0] as FileOutput | undefined;
        const fileId = firstFile?.fileId;

        if (signUrl && isDefined(fileId)) {
          return signUrl(fileId, FileFolder.FilesField);
        }
      } else if (isDefined(imageValue)) {
        const rawImageValue = String(imageValue);

        if (isNonEmptyString(rawImageValue)) {
          if (
            signUrl &&
            flatObjectMetadata.nameSingular === 'workspaceMember'
          ) {
            return signUrl(rawImageValue, FileFolder.FilesField);
          }

          return rawImageValue;
        }
      }
    }
  }

  if (flatObjectMetadata.nameSingular === 'company') {
    const domainNameObj = record.domainName as
      | { primaryLinkUrl?: string }
      | undefined;
    const domainNamePrimaryLinkUrl = domainNameObj?.primaryLinkUrl;

    return domainNamePrimaryLinkUrl
      ? getLogoUrlFromDomainName(domainNamePrimaryLinkUrl) || null
      : null;
  }

  //TODO: Temporary solution before imageIdentifier refactor
  if (signUrl && flatObjectMetadata.nameSingular === 'person') {
    const avatarFileId = (record.avatarFile as FileOutput[])?.[0]?.fileId;
    if (!isDefined(avatarFileId)) {
      return null;
    }
    return signUrl(avatarFileId, FileFolder.FilesField);
  }

  if (
    signUrl &&
    flatObjectMetadata.nameSingular === 'workspaceMember' &&
    isDefined(record.avatarUrl)
  ) {
    const avatarFileId = extractFileIdFromUrl(
      record.avatarUrl as string,
      FileFolder.CorePicture,
    );
    if (!isDefined(avatarFileId)) {
      return null;
    }
    return signUrl(avatarFileId, FileFolder.CorePicture);
  }

  return null;
};
