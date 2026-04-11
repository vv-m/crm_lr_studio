import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardProductViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'product'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allProductsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'allProducts',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 240,
      },
    }),
    allProductsCurrentPrice: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'allProducts',
        viewFieldName: 'currentPrice',
        fieldName: 'currentPrice',
        position: 1,
        isVisible: true,
        size: 160,
      },
    }),
    allProductsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'allProducts',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 2,
        isVisible: true,
        size: 180,
      },
    }),
    productRecordPageFieldsName: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'productRecordPageFields',
        viewFieldName: 'name',
        fieldName: 'name',
        position: 0,
        isVisible: true,
        size: 200,
      },
    }),
    productRecordPageFieldsCurrentPrice: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'productRecordPageFields',
        viewFieldName: 'currentPrice',
        fieldName: 'currentPrice',
        position: 1,
        isVisible: true,
        size: 200,
      },
    }),
    productRecordPageFieldsCreatedAt: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'productRecordPageFields',
        viewFieldName: 'createdAt',
        fieldName: 'createdAt',
        position: 2,
        isVisible: true,
        size: 180,
      },
    }),
    productRecordPageFieldsCreatedBy: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'product',
      context: {
        viewName: 'productRecordPageFields',
        viewFieldName: 'createdBy',
        fieldName: 'createdBy',
        position: 3,
        isVisible: true,
        size: 180,
      },
    }),
  };
};
