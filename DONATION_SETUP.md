# Donation Setup Instructions

You have successfully added a "Buy me a coffee" feature to your ExpensifyAI app!

## 1. Register on a Donation Platform
We recommend **Ko-fi** as it's free and easy to use.
1.  Go to [ko-fi.com](https://ko-fi.com).
2.  Sign up and create your page.
3.  Your link will look like: `https://ko-fi.com/yourusername`.

## 2. Configure Environment Variable
Instead of hardcoding the link, we now use an Environment Variable.

### For Local Development
The `.env` file has been automatically updated with a default value:
```
VITE_KOFI_URL=https://ko-fi.com/andreamura
```
Change this to your own URL if needed.

### For Cloudflare Pages (Production)
1.  Log in to the **Cloudflare Dashboard**.
2.  Go to **Pages** and select your project (`expensify-ai`).
3.  Go to **Settings** > **Environment variables**.
4.  Click **Add variable**.
    *   **Variable name**: `VITE_KOFI_URL`
    *   **Value**: `https://ko-fi.com/yourusername` (Your actual Ko-fi URL)
5.  Click **Save**.
6.  **Redeploy** your application for the changes to take effect.

## 3. Testing
1.  Open the **Settings** menu and click "Buy me a coffee".
2.  Verify it opens the URL defined in your environment variables.
