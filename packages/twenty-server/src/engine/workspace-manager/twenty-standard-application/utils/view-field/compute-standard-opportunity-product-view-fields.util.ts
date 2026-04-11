import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import {
  createStandardViewFieldFlatMetadata,
  type CreateStandardViewFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

export const computeStandardOpportunityProductViewFields = (
  args: Omit<CreateStandardViewFieldArgs<'opportunityProduct'>, 'context'>,
): Record<string, FlatViewField> => {
  return {
    allOpportunityProductsId: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityProduct',
      context: {
        viewName: 'allOpportunityProducts',
        viewFieldName: 'id',
        fieldName: 'id',
        position: 0,
        isVisible: true,
        size: 210,
      },
    }),
    allOpportunityProductsOpportunity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityProduct',
      context: {
        viewName: 'allOpportunityProducts',
        viewFieldName: 'opportunity',
        fieldName: 'opportunity',
        position: 1,
        isVisible: true,
        size: 200,
      },
    }),
    allOpportunityProductsProduct: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityProduct',
      context: {
        viewName: 'allOpportunityProducts',
        viewFieldName: 'product',
        fieldName: 'product',
        position: 2,
        isVisible: true,
        size: 200,
      },
    }),
    allOpportunityProductsQuantity: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityProduct',
      context: {
        viewName: 'allOpportunityProducts',
        viewFieldName: 'quantity',
        fieldName: 'quantity',
        position: 3,
        isVisible: true,
        size: 120,
      },
    }),
    allOpportunityProductsUnitPrice: createStandardViewFieldFlatMetadata({
      ...args,
      objectName: 'opportunityProduct',
      context: {
        viewName: 'allOpportunityProducts',
        viewFieldName: 'unitPrice',
        fieldName: 'unitPrice',
        position: 4,
        isVisible: true,
        size: 150,
      },
    }),
  };
};
