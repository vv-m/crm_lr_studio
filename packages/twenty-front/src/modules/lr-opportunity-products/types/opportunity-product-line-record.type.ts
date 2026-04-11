export type OpportunityProductLineRecord = {
  __typename: string;
  id: string;
  position?: number | null;
  productId: string;
  quantity: number;
  unitPrice: {
    amountMicros: number;
    currencyCode: string;
  } | null;
  product: {
    id: string;
    name: string;
    artikul?: string | null;
  } | null;
};
