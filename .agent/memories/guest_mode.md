---
description: Guest Mode Implementation
---
# Guest Mode

Implemented a guest mode that allows users to use the app without creating an account.

## Features
- **Bypass Login**: Added "Proceed without account" button on the login screen.
- **Local Storage**: Guest receipts are stored in `localStorage` under the key `guest_receipts`.
- **Data Persistence**: Data persists across reloads but is cleared on cache reset or browser change.
- **Banner**: A perpetual banner warns guest users about data volatility and prompts them to create an account.
- **State Management**: Added `isGuest` state to `App.tsx` to manage the session type.
- **API Bypass**: Supabase calls (fetch, save, update, delete, upload) are bypassed when in guest mode.
- **Data Sync**: When a guest user logs in or creates an account, they are prompted to sync their local receipts to the cloud.
- **Sign In Button**: Replaced the "Logout" icon with a prominent "Sign In" button for guest users.

## Files Modified
- `components/Auth.tsx`: Added guest login button.
- `App.tsx`: Implemented guest logic, state, banner, sync functionality, and UI updates.
