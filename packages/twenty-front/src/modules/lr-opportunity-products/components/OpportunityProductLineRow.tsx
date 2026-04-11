import { OpportunityProductInlineLabel } from '@/lr-opportunity-products/components/opportunity-product-inline-label.component';
import {
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS,
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE,
} from '@/lr-opportunity-products/constants/opportunity-products-table-grid.constant';
import { type OpportunityProductLineRecord } from '@/lr-opportunity-products/types/opportunity-product-line-record.type';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TextInput } from '@/ui/input/components/TextInput';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { convertCurrencyAmountToCurrencyMicros } from '~/utils/convertCurrencyToCurrencyMicros';
import { convertCurrencyMicrosToCurrencyAmount } from '~/utils/convertCurrencyToCurrencyMicros';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNumericInput = styled.input`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  height: 32px;
  max-width: 100%;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-align: right;
  width: 100%;
`;

const StyledLineTotal = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type OpportunityProductLineRowProps = {
  line: OpportunityProductLineRecord;
  defaultCurrencyCode: string;
  onDelete: (lineId: string) => void;
};

export const OpportunityProductLineRow = ({
  line,
  defaultCurrencyCode,
  onDelete,
}: OpportunityProductLineRowProps) => {
  const { t } = useLingui();
  const { updateOneRecord } = useUpdateOneRecord();

  const [quantityText, setQuantityText] = useState(String(line.quantity));
  const [unitAmountText, setUnitAmountText] = useState(() => {
    const unitMicros = line.unitPrice?.amountMicros;

    if (!isDefined(unitMicros) || unitMicros === 0) {
      return '';
    }

    return String(
      convertCurrencyMicrosToCurrencyAmount(unitMicros as number),
    );
  });

  useEffect(() => {
    setQuantityText(String(line.quantity));
  }, [line.quantity]);

  useEffect(() => {
    const unitMicros = line.unitPrice?.amountMicros;

    if (!isDefined(unitMicros) || unitMicros === 0) {
      setUnitAmountText('');
    } else {
      setUnitAmountText(
        String(convertCurrencyMicrosToCurrencyAmount(unitMicros as number)),
      );
    }
  }, [line.unitPrice?.amountMicros]);

  const unitMicros = line.unitPrice?.amountMicros ?? 0;
  const lineTotalMicros = unitMicros * (line.quantity ?? 0);

  const handleQuantityBlur = async () => {
    const nextQuantity = Number.parseFloat(quantityText);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      setQuantityText(String(line.quantity));

      return;
    }

    await updateOneRecord({
      objectNameSingular: 'opportunityProduct',
      idToUpdate: line.id,
      updateOneRecordInput: {
        quantity: nextQuantity,
      },
    });
  };

  const handleUnitPriceBlur = async () => {
    const nextUnitAmount = Number.parseFloat(unitAmountText.replace(',', '.'));

    if (!Number.isFinite(nextUnitAmount)) {
      const unitMicrosForReset = line.unitPrice?.amountMicros;

      if (!isDefined(unitMicrosForReset) || unitMicrosForReset === 0) {
        setUnitAmountText('');
      } else {
        setUnitAmountText(
          String(
            convertCurrencyMicrosToCurrencyAmount(
              unitMicrosForReset as number,
            ),
          ),
        );
      }

      return;
    }

    const currencyCode =
      line.unitPrice?.currencyCode ?? defaultCurrencyCode;

    await updateOneRecord({
      objectNameSingular: 'opportunityProduct',
      idToUpdate: line.id,
      updateOneRecordInput: {
        unitPrice: {
          amountMicros: convertCurrencyAmountToCurrencyMicros(nextUnitAmount),
          currencyCode,
        },
      },
    });
  };

  const productName = line.product?.name ?? line.productId;

  return (
    <TableRow
      gridAutoColumns={OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS}
      mobileGridAutoColumns={
        OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE
      }
    >
      <TableCell minWidth="0" overflow="hidden">
        <OpportunityProductInlineLabel
          artikul={line.product?.artikul}
          name={productName}
        />
      </TableCell>
      <TableCell minWidth="0" padding={`0 ${themeCssVariables.spacing[1]}`}>
        <StyledNumericInput
          min={0.0001}
          step="any"
          type="number"
          value={quantityText}
          onChange={(event) => {
            setQuantityText(event.target.value);
          }}
          onBlur={() => {
            void handleQuantityBlur();
          }}
        />
      </TableCell>
      <TableCell minWidth="0" padding={`0 ${themeCssVariables.spacing[1]}`}>
        <TextInput
          value={unitAmountText}
          onChange={(value) => {
            setUnitAmountText(value);
          }}
          onBlur={() => {
            void handleUnitPriceBlur();
          }}
          placeholder={t`Сумма`}
          fullWidth
        />
      </TableCell>
      <TableCell minWidth="0" overflow="hidden">
        <StyledLineTotal>
          {convertCurrencyMicrosToCurrencyAmount(lineTotalMicros).toFixed(2)}{' '}
          {line.unitPrice?.currencyCode ?? defaultCurrencyCode}
        </StyledLineTotal>
      </TableCell>
      <TableCell align="right">
        <IconButton
          Icon={IconTrash}
          size="small"
          variant="tertiary"
          onClick={() => {
            onDelete(line.id);
          }}
        />
      </TableCell>
    </TableRow>
  );
};
