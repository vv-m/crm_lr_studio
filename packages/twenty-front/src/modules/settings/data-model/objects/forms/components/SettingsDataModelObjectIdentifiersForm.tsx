import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isLabelIdentifierFieldMetadataTypes,
  isSearchableFieldType,
} from 'twenty-shared/utils';
import { IconCircleOff, IconPlus, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type z } from 'zod';

const IMAGE_IDENTIFIER_FIELD_METADATA_TYPES: FieldMetadataType[] = [
  FieldMetadataType.TEXT,
  FieldMetadataType.FILES,
];

export const settingsDataModelObjectIdentifiersFormSchema =
  objectMetadataItemSchema.pick({
    labelIdentifierFieldMetadataId: true,
    imageIdentifierFieldMetadataId: true,
  });

export type SettingsDataModelObjectIdentifiersFormValues = z.infer<
  typeof settingsDataModelObjectIdentifiersFormSchema
>;
export type SettingsDataModelObjectIdentifiers =
  keyof SettingsDataModelObjectIdentifiersFormValues;
type SettingsDataModelObjectIdentifiersFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};
const LABEL_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'labelIdentifierFieldMetadataId';
const IMAGE_IDENTIFIER_FIELD_METADATA_ID: SettingsDataModelObjectIdentifiers =
  'imageIdentifierFieldMetadataId';

const StyledContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsDataModelObjectIdentifiersForm = ({
  objectMetadataItem,
}: SettingsDataModelObjectIdentifiersFormProps) => {
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;
  const formConfig = useForm<SettingsDataModelObjectIdentifiersFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectIdentifiersFormSchema),
  });
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  // Submit only the field that just changed — for standard objects, sending
  // labelIdentifierFieldMetadataId (even unchanged) is rejected because it is
  // not in the backend's standard editable-properties list.
  const handleSaveSingleField = async (
    fieldName: SettingsDataModelObjectIdentifiers,
    value: string | null,
  ) => {
    const result = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { [fieldName]: value },
    });

    if (result.status === 'successful') {
      formConfig.reset(undefined, { keepValues: true });
    }
  };

  const { getIcon } = useIcons();
  const labelIdentifierFieldOptions = useMemo(
    () =>
      getActiveFieldMetadataItems(objectMetadataItem)
        .filter(
          ({ id, type }) =>
            (isLabelIdentifierFieldMetadataTypes(type) &&
              isSearchableFieldType(type)) ||
            objectMetadataItem.labelIdentifierFieldMetadataId === id,
        )
        .map<SelectOption<string | null>>((fieldMetadataItem) => ({
          Icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          value: fieldMetadataItem.id,
        })),
    [getIcon, objectMetadataItem],
  );
  const imageIdentifierFieldOptions = useMemo(
    () =>
      getActiveFieldMetadataItems(objectMetadataItem)
        .filter(
          ({ id, type }) =>
            IMAGE_IDENTIFIER_FIELD_METADATA_TYPES.includes(type) ||
            objectMetadataItem.imageIdentifierFieldMetadataId === id,
        )
        .map<SelectOption<string | null>>((fieldMetadataItem) => ({
          Icon: getIcon(fieldMetadataItem.icon),
          label: fieldMetadataItem.label,
          value: fieldMetadataItem.id,
        })),
    [getIcon, objectMetadataItem],
  );

  const emptyOption: SelectOption<string | null> = {
    Icon: IconCircleOff,
    label: t`None`,
    value: null,
  };

  const navigate = useNavigate();

  return (
    <StyledContainer>
      {[
        {
          label: t`Record label`,
          fieldName: LABEL_IDENTIFIER_FIELD_METADATA_ID,
          options: labelIdentifierFieldOptions,
          defaultValue: objectMetadataItem.labelIdentifierFieldMetadataId,
        },
        {
          label: t`Record image`,
          fieldName: IMAGE_IDENTIFIER_FIELD_METADATA_ID,
          options: imageIdentifierFieldOptions,
          defaultValue: objectMetadataItem.imageIdentifierFieldMetadataId,
        },
      ].map(({ fieldName, label, options, defaultValue }) => (
        <Controller
          key={fieldName}
          name={fieldName}
          control={formConfig.control}
          defaultValue={defaultValue}
          render={({ field: { onChange, value } }) => (
            <Select
              label={label}
              fullWidth
              dropdownId={`${fieldName}-select`}
              emptyOption={emptyOption}
              options={options}
              value={value}
              withSearchInput={label === t`Record label`}
              disabled={
                (label === t`Record label` && !objectMetadataItem.isCustom) ||
                readonly
              }
              callToActionButton={
                label === t`Record label`
                  ? {
                      text: 'Create Text Field',
                      Icon: IconPlus,
                      onClick: () => {
                        navigate('./new-field/select');
                      },
                    }
                  : undefined
              }
              onChange={(value) => {
                onChange(value);
                void handleSaveSingleField(fieldName, value);
              }}
            />
          )}
        />
      ))}
    </StyledContainer>
  );
};
