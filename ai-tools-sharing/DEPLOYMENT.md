# Vercel Deployment Guide

## Prerequisites

Before deploying to Vercel, make sure you have:

1. ✅ Supabase project created
2. ✅ Database tables set up (profiles, ai_tools)
3. ✅ Supabase Auth configured with email authentication
4. ✅ Environment variables ready

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Make sure your code is committed
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub/GitLab repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these from:**
- Supabase Dashboard → Project Settings → API
- Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Configure Supabase Auth Redirect URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**`

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your deployed site

## Common Issues & Fixes

### 404 Errors

**Possible causes:**
1. **Missing middleware** - ✅ Fixed (middleware.ts created)
2. **Environment variables not set** - Check Vercel dashboard
3. **Auth redirect URLs** - Make sure Vercel URL is in Supabase settings

### Environment Variables Not Working

- Make sure variables are prefixed with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/changing environment variables
- Check Vercel build logs for errors

### Build Errors

Check build logs in Vercel dashboard. Common issues:
- Missing dependencies
- TypeScript errors
- Missing environment variables

### Auth Not Working

1. Check Supabase Auth redirect URLs include your Vercel domain
2. Verify environment variables are set correctly
3. Check browser console for errors

## Testing After Deployment

1. ✅ Visit home page - should show sign-in prompt if not authenticated
2. ✅ Sign up a new account
3. ✅ Sign in
4. ✅ Submit a workflow
5. ✅ View workflows on home page
6. ✅ Test search functionality
7. ✅ Check dashboard shows your workflows

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase Auth redirect URLs configured
- [ ] Database tables created
- [ ] Test sign up/sign in flow
- [ ] Test workflow submission
- [ ] Verify search works
- [ ] Check all pages load correctly

## Troubleshooting

### Still Getting 404?

1. Check Vercel build logs - look for errors
2. Verify all routes exist in `app/` directory
3. Make sure `middleware.ts` is in the root
4. Check browser console for client-side errors

### Auth Redirect Issues?

Update Supabase Dashboard → Authentication → URL Configuration with your Vercel URL

### Database Connection Issues?

Verify:
- Environment variables are correct
- Supabase project is active
- Tables exist in database
- RLS policies allow access
