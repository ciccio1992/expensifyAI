
# Currency Formatting Standardization

- Created `formatAmount` utility in `services/currencyService.ts` to standardize currency display.
- `formatAmount` uses `de-DE` locale for EUR (comma decimal) and `en-US` for others (dot decimal).
- Enforces 2 decimal places using `minimumFractionDigits: 2` and `maximumFractionDigits: 2`.
- Updated `Dashboard`, `ReceiptList`, `ReceiptDetail`, `MapView`, and `ExportModal` (PDF) to use `formatAmount`.
- Kept CSV export as `toFixed(2)` (dot decimal) for better machine readability.
