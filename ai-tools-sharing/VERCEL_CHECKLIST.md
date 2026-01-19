# Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables
- [ ] Add to Vercel Dashboard → Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Supabase Configuration
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Add your Vercel URL to **Site URL**: `https://your-app.vercel.app`
- [ ] Add to **Redirect URLs**:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-app.vercel.app/**`

### 3. Database Setup
- [ ] Run migration: `001_initial_schema.sql`
- [ ] Verify tables exist: `profiles` and `ai_tools`
- [ ] Test locally that everything works

## 🚀 Deployment Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import your repository
   - Vercel auto-detects Next.js ✅

3. **Add Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

5. **Update Supabase Redirect URLs**
   - After deployment, copy your Vercel URL
   - Add it to Supabase Auth settings

## 🔍 Debugging 404 Errors

### Common Causes:
1. **Missing Environment Variables** - Check Vercel dashboard
2. **Supabase Redirect URLs** - Must include your Vercel domain
3. **Build Errors** - Check Vercel build logs
4. **Missing Middleware** - ✅ Already added

### Check Build Logs:
- Go to Vercel Dashboard → Deployments → Click on deployment
- Check "Build Logs" for errors
- Check "Runtime Logs" for runtime errors

### Test These URLs:
- `https://your-app.vercel.app/` - Home page
- `https://your-app.vercel.app/auth/signin` - Sign in
- `https://your-app.vercel.app/auth/signup` - Sign up
- `https://your-app.vercel.app/about` - About page

## ✅ Post-Deployment Testing

1. Visit home page - should work
2. Sign up - should create account
3. Sign in - should authenticate
4. Submit workflow - should save to database
5. View workflows - should display on home page
6. Test search - should filter results
7. Check dashboard - should show your tools

## 📝 Important Notes

- **Never commit `.env.local`** - Environment variables should only be in Vercel
- **Middleware is required** - Handles auth session refresh
- **Supabase redirect URLs** - Must match your Vercel domain exactly
- **Build time** - First deploy may take 2-3 minutes
