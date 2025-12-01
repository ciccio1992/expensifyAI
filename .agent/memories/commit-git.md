# Commit History

## Fix Manual Entry Save Crash
- **Date**: 2025-12-01
- **Features**:
  - Fixed a crash in `ManualEntryModal` caused by using an emoji in `btoa` for the placeholder image generation. Replaced the emoji with ASCII SVG shapes.
- **Files**: `components/ManualEntryModal.tsx`.

## Fix Receipt Details & Manual Entry
- **Date**: 2025-12-01
- **Features**:
  - Fixed an issue where clicking on a receipt would not open the details view.
  - Fixed the "Save Expense" flow in manual entry to correctly open the details of the newly created receipt.
- **Files**: `App.tsx`.

## Fix Scanner Navigation
- **Date**: 2025-12-01
- **Features**:
  - Fixed the "Add Receipt" button not opening the scanner by adding the `Scanner` component to the `App` render method.
- **Files**: `App.tsx`.

## Feedback Feature
- **Date**: 2025-12-01
- **Features**:
  - Added floating feedback button and modal.
  - Implemented feedback submission to Supabase.
- **Files**: `App.tsx`, `components/FeedbackButton.tsx`, `components/FeedbackModal.tsx`, `services/supabaseClient.ts`, `types.ts`, `FEEDBACK_SETUP.md`.

## Guest Mode UI Polish
- **Date**: 2025-12-01
- **Features**:
  - Styled "Proceed without account" link as a full-width button to match the theme.
- **Files**: `components/Auth.tsx`.

## Guest Mode Redirects
- **Date**: 2025-12-01
- **Features**:
  - Updated "Create an account" link in guest banner to open Auth screen in "Sign Up" mode.
  - Updated "Sign In" button in header to open Auth screen in "Sign In" mode.
- **Files**: `App.tsx`, `components/Auth.tsx`.

## Guest Mode UI Update
- **Date**: 2025-12-01
- **Features**:
  - Replaced "Logout" icon with a green "Sign In" button for guest users in the dashboard header.
- **Files**: `App.tsx`.

## Guest Mode Sync Feature
- **Date**: 2025-12-01
- **Features**:
  - Implemented `syncGuestData` function in `App.tsx`.
  - Updated `useEffect` to trigger sync prompt upon login if guest data exists.
  - Handles image upload and database insertion for synced receipts.
  - Clears local storage upon successful sync or user decline.
- **Files**: `App.tsx`.

## Guest Mode Implementation
- **Date**: 2025-12-01
- **Features**:
  - Added "Proceed without account" option to Login.
  - Implemented `isGuest` state in `App.tsx`.
  - Implemented local storage persistence for guest receipts.
  - Added warning banner for guest users.
- **Files**: `App.tsx`, `components/Auth.tsx`.
