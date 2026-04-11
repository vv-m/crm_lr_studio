import { OpportunityProductSearchAddRow } from '@/lr-opportunity-products/components/opportunity-product-search-add-row.component';
import { OpportunityProductLineRow } from '@/lr-opportunity-products/components/OpportunityProductLineRow';
import {
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS,
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE,
  OPPORTUNITY_PRODUCTS_TABLE_MIN_WIDTH_PX,
} from '@/lr-opportunity-products/constants/opportunity-products-table-grid.constant';
import { type OpportunityProductLineRecord } from '@/lr-opportunity-products/types/opportunity-product-line-record.type';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { CurrencyCode } from 'twenty-shared/constants';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  convertCurrencyAmountToCurrencyMicros,
  convertCurrencyMicrosToCurrencyAmount,
} from '~/utils/convertCurrencyToCurrencyMicros';

type OpportunityAmount = {
  amountMicros: number;
  currencyCode: string;
} | null;

const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
  overflow-x: auto;
  min-width: 0;
`;

const StyledTableMinWidth = styled.div``;

const StyledTotalLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTotalAmount = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OpportunityProductsRecordTabBody = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();

  const opportunityId = targetRecord.id;

  const { record: opportunity } = useFindOneRecord({
    objectNameSingular: 'opportunity',
    objectRecordId: opportunityId,
    recordGqlFields: {
      id: true,
      amount: true,
    },
    skip: !isDefined(opportunityId),
  });

  const { recordGqlFields: opportunityProductRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular: 'opportunityProduct',
      depth: 1,
      shouldOnlyLoadRelationIdentifiers: false,
    });

  const { records: lines, loading } = useFindManyRecords<OpportunityProductLineRecord>(
    {
      objectNameSingular: 'opportunityProduct',
      filter: {
        opportunityId: {
          eq: opportunityId,
        },
      },
      orderBy: [
        { position: 'AscNullsFirst' },
        { createdAt: 'AscNullsLast' },
      ],
      recordGqlFields: opportunityProductRecordGqlFields,
      skip: !isDefined(opportunityId),
    },
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'opportunityProduct',
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: 'opportunityProduct',
  });

  const defaultCurrencyCode = useMemo((): string => {
    const opportunityAmount = (
      opportunity as { amount?: OpportunityAmount } | undefined
    )?.amount;
    const currencyCode = opportunityAmount?.currencyCode;

    if (typeof currencyCode === 'string' && currencyCode.length > 0) {
      return currencyCode;
    }

    return CurrencyCode.USD;
  }, [opportunity]);

  const linesTotalMicros = useMemo(
    () =>
      lines.reduce((accumulator, line) => {
        const unitMicros = line.unitPrice?.amountMicros ?? 0;
        const quantity = line.quantity ?? 0;

        return accumulator + unitMicros * quantity;
      }, 0),
    [lines],
  );

  const handleAddProductFromSearch = async (productId: string) => {
    const maxLinePosition = lines.reduce((accumulator, line) => {
      const linePosition = line.position ?? 0;

      return Math.max(accumulator, linePosition);
    }, -1);
    const nextLinePosition = maxLinePosition + 1;

    await createOneRecord({
      opportunityId,
      productId,
      quantity: 1,
      unitPrice: {
        amountMicros: convertCurrencyAmountToCurrencyMicros(0),
        currencyCode: defaultCurrencyCode,
      },
      position: nextLinePosition,
    });
  };

  const handleDeleteLine = (lineId: string) => {
    deleteOneRecord(lineId);
  };

  return (
    <StyledRoot>
      <StyledTableMinWidth
        style={{ minWidth: `${OPPORTUNITY_PRODUCTS_TABLE_MIN_WIDTH_PX}px` }}
      >
        <Table>
          <TableRow
            gridAutoColumns={OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS}
            mobileGridAutoColumns={
              OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE
            }
          >
            <TableHeader>{t`Товар`}</TableHeader>
            <TableHeader
              padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
            >
              {t`Шт.`}
            </TableHeader>
            <TableHeader padding={`0 ${themeCssVariables.spacing[2]}`}>
              {t`Цена`}
            </TableHeader>
            <TableHeader>{t`Сумма`}</TableHeader>
            <TableHeader />
          </TableRow>
          <TableBody>
            {loading
              ? null
              : lines.map((line) => (
                  <OpportunityProductLineRow
                    key={line.id}
                    line={line}
                    defaultCurrencyCode={defaultCurrencyCode}
                    onDelete={handleDeleteLine}
                  />
                ))}
            <OpportunityProductSearchAddRow
              onProductSelected={handleAddProductFromSearch}
            />
            {!loading ? (
              <TableRow
                gridAutoColumns={OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS}
                mobileGridAutoColumns={
                  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE
                }
                style={{
                  borderTop: `1px solid ${themeCssVariables.border.color.light}`,
                  marginTop: themeCssVariables.spacing[2],
                }}
              >
                <TableCell minWidth="0" overflow="hidden">
                  <StyledTotalLabel>{t`Итого`}</StyledTotalLabel>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell minWidth="0" overflow="hidden">
                  <StyledTotalAmount>
                    {convertCurrencyMicrosToCurrencyAmount(
                      linesTotalMicros,
                    ).toFixed(2)}{' '}
                    {defaultCurrencyCode}
                  </StyledTotalAmount>
                </TableCell>
                <TableCell />
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </StyledTableMinWidth>
    </StyledRoot>
  );
};

export const OpportunityProductsRecordTab = () => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const { objectMetadataItems } = useObjectMetadataItems();

  if (targetRecord.targetObjectNameSingular !== 'opportunity') {
    return null;
  }

  const hasOpportunityProductObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular ===
      CoreObjectNameSingular.OpportunityProduct,
  );

  if (!hasOpportunityProductObjectMetadata) {
    return (
      <StyledRoot>
        <Status
          color="red"
          text={t`Opportunity line items are not available in this workspace`}
        />
      </StyledRoot>
    );
  }

  return <OpportunityProductsRecordTabBody />;
};
