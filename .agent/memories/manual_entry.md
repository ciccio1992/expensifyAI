
# Feature: Manual Expense Entry
- **Date**: 2025-12-01
- **Description**: Added ability for users to manually input expense details without scanning a receipt.
- **Components**: 
  - Created `ManualEntryModal.tsx` for the input form.
  - Updated `Dashboard.tsx` to include a "Manual Entry" button (pencil icon) above the scan button.
  - Updated `App.tsx` to handle manual submission, including generating a placeholder image and uploading it to Supabase Storage to ensure persistence.
- **Technical Details**:
  - Uses a generated SVG data URI as a placeholder image for manual entries.
  - Reuses `uploadReceiptImage` to store the placeholder, ensuring consistent data handling with scanned receipts.
