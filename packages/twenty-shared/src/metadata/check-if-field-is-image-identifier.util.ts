import { type Nullable } from '@/types';

export const checkIfFieldIsImageIdentifier = (
  fieldMetadataItem: {
    id: string;
    name: string;
  },
  objectMetadataItem: {
    nameSingular: string;
    imageIdentifierFieldMetadataId?: Nullable<string>;
  },
): boolean => {
  // Explicit per-object image identifier takes precedence over any implicit default.
  if (
    objectMetadataItem.imageIdentifierFieldMetadataId !== null &&
    objectMetadataItem.imageIdentifierFieldMetadataId !== undefined
  ) {
    return (
      objectMetadataItem.imageIdentifierFieldMetadataId === fieldMetadataItem.id
    );
  }

  // Fallback: Company's domainName is implicitly used to resolve a favicon.
  if (
    objectMetadataItem.nameSingular === 'company' &&
    fieldMetadataItem.name === 'domainName'
  ) {
    return true;
  }

  return false;
};
