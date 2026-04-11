import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLoader } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDebounce } from 'use-debounce';

import { OpportunityProductInlineLabel } from '@/lr-opportunity-products/components/opportunity-product-inline-label.component';
import {
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS,
  OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE,
} from '@/lr-opportunity-products/constants/opportunity-products-table-grid.constant';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectRecordSearchRecords } from '@/object-record/hooks/useObjectRecordSearchRecords';
import { TextInput } from '@/ui/input/components/TextInput';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const OPPORTUNITY_PRODUCT_SEARCH_ADD_ROW_CLICK_OUTSIDE_ID =
  'opportunity-product-search-add-row';

const StyledSearchTableCell = styled(TableCell)`
  min-width: 0;
`;

const StyledSearchCell = styled.div`
  position: relative;
  width: 100%;
`;

const StyledResults = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  left: 0;
  margin-top: ${themeCssVariables.spacing[1]};
  max-height: 240px;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
`;

const StyledResultButton = styled.button<{ isHighlighted?: boolean }>`
  background: ${({ isHighlighted }) =>
    isHighlighted ? themeCssVariables.background.tertiary : 'transparent'};
  border: none;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: block;
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`;

const StyledEmptyHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type ProductSearchLabelRecord = {
  __typename: string;
  id: string;
  name: string | null;
  artikul: string | null;
};

type OpportunityProductSearchAddRowProps = {
  onProductSelected: (productId: string) => Promise<void>;
};

export const OpportunityProductSearchAddRow = ({
  onProductSelected,
}: OpportunityProductSearchAddRowProps) => {
  const { t } = useLingui();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 300);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootReference = useRef<HTMLDivElement>(null);
  const resultsContainerReference = useRef<HTMLDivElement>(null);

  const { searchRecords, loading } = useObjectRecordSearchRecords({
    objectNameSingulars: [CoreObjectNameSingular.Product],
    searchInput: debouncedSearchText,
    skip: debouncedSearchText.trim().length === 0,
  });

  const productSearchRecords = searchRecords.filter(
    (record) => record.objectNameSingular === CoreObjectNameSingular.Product,
  );

  const productSearchRecordIds = useMemo(
    () => productSearchRecords.map((record) => String(record.recordId)),
    [productSearchRecords],
  );

  const { records: productLabelRecords } =
    useFindManyRecords<ProductSearchLabelRecord>({
      objectNameSingular: CoreObjectNameSingular.Product,
      filter: { id: { in: productSearchRecordIds } },
      recordGqlFields: {
        id: true,
        name: true,
        artikul: true,
      },
      skip:
        productSearchRecordIds.length === 0 ||
        debouncedSearchText.trim().length === 0,
    });

  const productLabelById = useMemo(() => {
    const map = new Map<string, ProductSearchLabelRecord>();

    for (const record of productLabelRecords) {
      map.set(record.id, record);
    }

    return map;
  }, [productLabelRecords]);

  useListenClickOutside({
    refs: [rootReference],
    callback: () => {
      setIsResultsOpen(false);
    },
    listenerId: OPPORTUNITY_PRODUCT_SEARCH_ADD_ROW_CLICK_OUTSIDE_ID,
    enabled: isResultsOpen,
  });

  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedSearchText, productSearchRecords.length]);

  useEffect(() => {
    const container = resultsContainerReference.current;

    if (!isDefined(container)) {
      return;
    }

    const highlightedButton =
      container.querySelectorAll('button')[highlightedIndex];

    if (isDefined(highlightedButton)) {
      highlightedButton.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const selectProductById = async (productId: string) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onProductSelected(productId);
      setSearchText('');
      setIsResultsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProduct = async (
    event: ReactMouseEvent,
    productId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    await selectProductById(productId);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (productSearchRecords.length === 0 || !isResultsOpen) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex(
        (previousIndex) => (previousIndex + 1) % productSearchRecords.length,
      );

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(
        (previousIndex) =>
          (previousIndex - 1 + productSearchRecords.length) %
          productSearchRecords.length,
      );

      return;
    }

    if (event.key === 'Enter') {
      const selectedRecord = productSearchRecords[highlightedIndex];

      if (!isDefined(selectedRecord)) {
        return;
      }

      event.preventDefault();
      void selectProductById(String(selectedRecord.recordId));

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsResultsOpen(false);
    }
  };

  return (
    <TableRow
      gridAutoColumns={OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS}
      mobileGridAutoColumns={
        OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE
      }
      style={{
        marginTop: themeCssVariables.spacing[1],
      }}
    >
      <StyledSearchTableCell padding="0" overflow="visible">
        <StyledSearchCell ref={rootReference}>
          <TextInput
            value={searchText}
            placeholder={t`+ Добавить товар`}
            fullWidth
            onChange={(value) => {
              setSearchText(value);
              setIsResultsOpen(true);
            }}
            onFocus={() => {
              setIsResultsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
          />
          {isResultsOpen && searchText.trim().length > 0 ? (
            <StyledResults ref={resultsContainerReference}>
              {loading ? (
                <StyledEmptyHint>
                  <IconLoader size={themeCssVariables.icon.size.md} />
                </StyledEmptyHint>
              ) : null}
              {!loading && productSearchRecords.length === 0 ? (
                <StyledEmptyHint>{t`No records`}</StyledEmptyHint>
              ) : null}
              {!loading
                ? productSearchRecords.map((record, index) => {
                    const recordId = String(record.recordId);
                    const productDetails = productLabelById.get(recordId);
                    const displayName =
                      productDetails?.name ?? record.label ?? '';

                    return (
                      <StyledResultButton
                        key={record.recordId}
                        type="button"
                        disabled={isSubmitting}
                        isHighlighted={index === highlightedIndex}
                        onMouseEnter={() => {
                          setHighlightedIndex(index);
                        }}
                        onMouseDown={(event) => {
                          void handleSelectProduct(event, recordId);
                        }}
                      >
                        <OpportunityProductInlineLabel
                          artikul={productDetails?.artikul}
                          name={displayName}
                        />
                      </StyledResultButton>
                    );
                  })
                : null}
            </StyledResults>
          ) : null}
        </StyledSearchCell>
      </StyledSearchTableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
    </TableRow>
  );
};
