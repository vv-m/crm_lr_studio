// Quantity (short label + input), unit price ~7 digits; product flexes.
// Fixed minimum widths prevent columns from collapsing when the side panel
// is narrowed; the table container scrolls horizontally instead.
export const OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS =
  'minmax(200px, 1fr) 56px minmax(96px, 96px) minmax(120px, 1fr) 40px';

export const OPPORTUNITY_PRODUCTS_TABLE_GRID_AUTO_COLUMNS_MOBILE =
  'minmax(180px, 1fr) 56px minmax(88px, 88px) minmax(104px, 1fr) 40px';

// Sum of min column widths, used as table min-width to trigger horizontal scroll.
export const OPPORTUNITY_PRODUCTS_TABLE_MIN_WIDTH_PX = 200 + 56 + 96 + 120 + 40;
