# Commit History

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
