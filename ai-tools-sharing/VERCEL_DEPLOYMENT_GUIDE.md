# Step-by-Step Vercel Deployment Guide

## 📋 Prerequisites Checklist

Before deploying, make sure you have:
- [ ] GitHub/GitLab/Bitbucket account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Supabase project created
- [ ] Git repository with your code

---

## Step 1: Prepare Your Repository

### 1.1 Commit and Push Your Code

```bash
# Navigate to your project
cd /Users/ajitha3008/Desktop/AiToolsSharing/ai-tools-sharing

# Check git status
git status

# Add all changes (if any)
git add .

# Commit changes
git commit -m "Ready for Vercel deployment"

# Push to remote repository
git push origin main
```

**Important**: Make sure your code is pushed to GitHub/GitLab/Bitbucket before proceeding.

---

## Step 2: Create/Configure Supabase Project

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `ai-tools-sharing` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - Click **"Create new project"**
5. Wait for project setup (2-3 minutes)

### 2.2 Run Database Migration (REQUIRED)

**⚠️ IMPORTANT**: You **MUST** run this migration! A new Supabase database is empty and won't work without these tables and policies.

**Why is this required?**
- Creates `profiles` and `ai_tools` tables that your app needs
- Sets up Row Level Security (RLS) policies (required for data access)
- Creates triggers for auto-creating profiles on signup
- Adds performance indexes

**How to run (takes 30 seconds):**
1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**
4. Open file: `supabase/migrations/001_initial_schema.sql` from your project
5. **Copy the entire contents** of the file
6. **Paste** into the Supabase SQL Editor
7. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
8. Wait for success message: ✅ "Success. No rows returned"

**Verify migration worked:**
- Go to **"Table Editor"** in sidebar
- You should see: `profiles` and `ai_tools` tables
- If tables don't appear, refresh the page

**Alternative (Manual Setup):**
You *could* create everything manually through Supabase UI, but it's:
- ❌ Time-consuming (takes 15-20 minutes)
- ❌ Error-prone (easy to miss policies or triggers)
- ❌ Not recommended

**Just use the migration SQL - it's the standard way!** ✅

### 2.3 Get Supabase Credentials

1. Go to **Supabase Dashboard** → Your Project
2. Click **"Project Settings"** (gear icon)
3. Click **"API"** in the sidebar
4. Copy these values (you'll need them in Step 4):
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 3: Configure Supabase Auth Settings

### 3.1 Configure Redirect URLs

1. Go to **Supabase Dashboard** → Your Project
2. Click **"Authentication"** → **"URL Configuration"**
3. Set **Site URL** to: `https://your-project.vercel.app` (you'll update this after deployment)
4. Add to **Redirect URLs**:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```

**Note**: You'll update this with your actual Vercel URL after deployment (Step 6).

---

## Step 4: Deploy to Vercel

### 4.1 Import Your Repository

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub/GitLab/Bitbucket
3. Click **"Add New Project"** (or **"New Project"**)
4. Import your repository:
   - Select your repository from the list
   - Click **"Import"**

### 4.2 Configure Project Settings

Vercel will auto-detect Next.js, but verify:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `./ai-tools-sharing` (or leave as root if repo is directly the Next.js app)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Important**: If your Next.js app is in a subdirectory (like `ai-tools-sharing/`), set **Root Directory** to `./ai-tools-sharing`

### 4.3 Add Environment Variables

**Before clicking "Deploy"**, add environment variables:

1. In the **Environment Variables** section, click **"Add"**
2. Add these two variables:

   **Variable 1:**
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: (Paste your Supabase Project URL from Step 2.3)
   - **Environments**: Select all (Production, Preview, Development)

   **Variable 2:**
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: (Paste your Supabase anon key from Step 2.3)
   - **Environments**: Select all (Production, Preview, Development)

3. Click **"Deploy"** button

---

## Step 5: Wait for Deployment

### 5.1 Monitor Build Process

1. Vercel will show build logs in real-time
2. Wait for build to complete (usually 2-3 minutes)
3. Look for: ✅ **Build successful** or **"Ready"** message

### 5.2 Check for Build Errors

If build fails:
- Check build logs for errors
- Common issues:
  - Missing environment variables → Go back to Step 4.3
  - TypeScript errors → Check error messages
  - Missing dependencies → Check `package.json`

---

## Step 6: Configure Supabase with Vercel URL

### 6.1 Get Your Vercel URL

After deployment, Vercel will show:
- **Production URL**: `https://your-project.vercel.app`
- Copy this URL

### 6.2 Update Supabase Redirect URLs

1. Go to **Supabase Dashboard** → Your Project
2. Click **"Authentication"** → **"URL Configuration"**
3. Set **Site URL** to: `https://your-project.vercel.app` (your actual Vercel URL)
4. Update **Redirect URLs** to:
   ```
   https://your-project.vercel.app/auth/callback
   https://your-project.vercel.app/**
   ```
5. Click **"Save"**

**This is critical** - without this, authentication won't work!

---

## Step 7: Test Your Deployment

### 7.1 Visit Your Site

1. Click the **"Visit"** button in Vercel (or go to your Vercel URL)
2. You should see your home page

### 7.2 Test Authentication

1. Click **"Sign Up"** or **"Get Started"**
2. Create a test account
3. Verify you can:
   - ✅ Sign up successfully
   - ✅ Sign in successfully
   - ✅ Submit a workflow
   - ✅ View workflows on home page
   - ✅ View your workflows on dashboard

### 7.3 Check Vercel Logs (if errors)

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Logs"** in sidebar
3. Check for any runtime errors
4. Look for `[Proxy]` or error messages

---

## Step 8: (Optional) Custom Domain

### 8.1 Add Custom Domain

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Click **"Domains"**
3. Enter your domain name
4. Follow Vercel's DNS configuration instructions

---

## 🔧 Troubleshooting

### Issue: 500 Errors

**Solution**: 
- Check Vercel logs for specific errors
- Verify environment variables are set correctly
- Check Supabase redirect URLs match your Vercel URL

### Issue: Authentication Not Working

**Solution**:
1. Verify Supabase redirect URLs include your Vercel domain
2. Check environment variables are set in Vercel
3. Check browser console for errors

### Issue: Build Fails

**Solution**:
1. Check build logs for TypeScript errors
2. Verify all dependencies are in `package.json`
3. Check if there are any missing environment variables

### Issue: "Cannot connect to database"

**Solution**:
1. Verify Supabase project is active
2. Check database migrations were run (Step 2.2)
3. Verify environment variables are correct

### Issue: Environment Variables Not Working

**Solution**:
1. Make sure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding/changing environment variables
3. Check variables are set for correct environments (Production/Preview/Development)

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads without errors
- [ ] Can sign up new account
- [ ] Can sign in with account
- [ ] Can submit a workflow
- [ ] Workflows appear on home page
- [ ] Dashboard shows user's workflows
- [ ] Search functionality works
- [ ] No console errors in browser

---

## 📝 Quick Reference

### Environment Variables Needed:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Settings:
- **Site URL**: Your Vercel URL
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

### Important Files:
- Database migration: `supabase/migrations/001_initial_schema.sql`
- Must be run in Supabase SQL Editor before deployment

---

## 🆘 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**You're all set!** Follow these steps in order, and your app will be live on Vercel. 🚀
