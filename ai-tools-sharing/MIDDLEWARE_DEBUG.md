# Debugging Middleware Errors

## How to View Middleware Error Details

### 1. Check Vercel Logs (Recommended)
The middleware now logs detailed errors to Vercel logs:

1. Go to **Vercel Dashboard** → Your Project
2. Click on **Logs** in the sidebar
3. Look for entries starting with `[Middleware]`
4. Errors will show:
   - Error message
   - Error code/status
   - Stack trace
   - Request URL and method
   - Timestamp

### 2. Check Browser Dev Tools (Development Only)
In development mode, error details are added to response headers:

1. Open **Browser Dev Tools** (F12)
2. Go to **Network** tab
3. Select the failed request
4. Check **Response Headers** for:
   - `x-middleware-error: true`
   - `x-middleware-error-message: [error message]`
   - `x-middleware-error-details: [JSON details]` (dev only)

### 3. Common Middleware Errors

#### Missing Environment Variables
- **Error**: `Missing environment variables`
- **Fix**: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel

#### Cookie Errors
- **Error**: `Error getting cookies` or `Error setting cookie`
- **Fix**: Usually related to Edge runtime limitations - errors are caught and logged

#### Auth Errors
- **Error**: `Auth getUser error`
- **Fix**: Check Supabase project is active and credentials are correct

### 4. Testing Middleware Locally

Run locally to see detailed console output:
```bash
npm run dev
```

Check terminal output for `[Middleware]` logs.

### 5. Disable Middleware Temporarily

If you need to disable middleware for debugging:
1. Rename `middleware.ts` to `middleware.ts.bak`
2. Redeploy
3. This will skip middleware entirely

**Note**: Authentication will still work in client components, but session refresh won't happen automatically.
