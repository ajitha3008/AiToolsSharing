# 🚀 Vercel Deployment Guide

## ✅ What I've Fixed for Vercel Deployment

### 1. Added Middleware (`middleware.ts`)
- ✅ Handles Supabase auth session refresh on every request
- ✅ Required for proper authentication in production

### 2. Fixed Auth Callback Route
- ✅ Updated `/app/auth/callback/route.ts` to handle Vercel URLs properly
- ✅ Better error handling for auth callback failures

### 3. Fixed Window Location References
- ✅ Added `typeof window !== 'undefined'` checks for SSR compatibility
- ✅ Prevents build errors on Vercel

### 4. Removed Unnecessary Config
- ✅ Cleaned up `next.config.ts` (removed unnecessary env config)

---

## 📋 CRITICAL Steps Before Deploying

### Step 1: Set Environment Variables in Vercel

**In Vercel Dashboard → Your Project → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Where to find these:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Configure Supabase Redirect URLs

**This is CRITICAL - 404 errors often happen because this isn't set!**

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

### Step 3: Deploy to Vercel

1. Push your code:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. In Vercel:
   - Import your repository
   - Vercel will auto-detect Next.js
   - Add environment variables (Step 1)
   - Click "Deploy"

3. **After deployment**, update Supabase redirect URLs with your actual Vercel URL (Step 2)

---

## 🔍 Troubleshooting 404 Errors

### If you're getting 404:

1. **Check Build Logs**
   - Vercel Dashboard → Deployments → Click deployment → Build Logs
   - Look for errors

2. **Verify Environment Variables**
   - Settings → Environment Variables
   - Make sure both variables are set
   - **Redeploy** after adding variables

3. **Check Supabase Redirect URLs**
   - Must include your exact Vercel URL
   - Format: `https://your-app.vercel.app/auth/callback`

4. **Test Routes**
   - Try: `https://your-app.vercel.app/`
   - Try: `https://your-app.vercel.app/auth/signin`
   - Try: `https://your-app.vercel.app/about`

### Common Issues:

| Issue | Solution |
|-------|----------|
| 404 on all pages | Check build succeeded, verify routes exist |
| 404 on auth pages | Check Supabase redirect URLs |
| Auth not working | Verify environment variables, check Supabase settings |
| Build fails | Check build logs, verify dependencies |

---

## ✅ Post-Deployment Checklist

- [ ] Home page loads (`/`)
- [ ] Sign up works (`/auth/signup`)
- [ ] Sign in works (`/auth/signin`)
- [ ] Can submit workflow (`/submit`)
- [ ] Dashboard shows tools (`/dashboard`)
- [ ] Search works on home page
- [ ] About page loads (`/about`)

---

## 🎯 Quick Reference

**Files Added/Modified:**
- ✅ `middleware.ts` - Auth session handling
- ✅ `app/auth/callback/route.ts` - Fixed redirect handling
- ✅ `app/auth/signup/page.tsx` - Fixed SSR compatibility
- ✅ `app/test-supabase/auth-test/page.tsx` - Fixed SSR compatibility

**Environment Variables Needed:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Supabase Settings:**
- Site URL: Your Vercel URL
- Redirect URLs: Must include `/auth/callback`

---

## 💡 Pro Tips

1. **Test locally first** - Make sure everything works before deploying
2. **Check Vercel logs** - Runtime errors show in deployment logs
3. **Redeploy after env changes** - Environment variables require redeploy
4. **Use Preview Deployments** - Test before merging to main

---

**Need help?** Check `VERCEL_CHECKLIST.md` for detailed steps.
