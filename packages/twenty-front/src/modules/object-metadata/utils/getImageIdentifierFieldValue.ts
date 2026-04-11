import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Reads the raw avatar URL from a record for a given image identifier field.
// Supports plain TEXT fields (URL string) and FILES fields (first uploaded file).
export const getImageIdentifierFieldValue = (
  record: ObjectRecord,
  imageIdentifierFieldMetadataItem: FieldMetadataItem | undefined,
): string | null => {
  if (!isDefined(imageIdentifierFieldMetadataItem?.name)) {
    return null;
  }

  const rawValue = record[imageIdentifierFieldMetadataItem.name];

  if (imageIdentifierFieldMetadataItem.type === FieldMetadataType.FILES) {
    const files = rawValue as Array<{ fullPath?: string; url?: string }> | null;
    const firstFileUrl = files?.[0]?.fullPath ?? files?.[0]?.url;

    return isDefined(firstFileUrl) ? firstFileUrl : null;
  }

  if (typeof rawValue === 'string' && rawValue.length > 0) {
    return rawValue;
  }

  return null;
};
