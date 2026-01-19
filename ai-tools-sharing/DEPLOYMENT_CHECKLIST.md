# Pre-Deployment Checklist

Use this checklist before deploying to Vercel to ensure everything is ready.

## ✅ Code Preparation

- [ ] All code is committed to git
- [ ] Code is pushed to GitHub/GitLab/Bitbucket
- [ ] No TypeScript errors (run `npm run build` locally)
- [ ] No console errors in browser (test locally with `npm run dev`)

## ✅ Database Setup

- [ ] Supabase project is created
- [ ] Database migration (`001_initial_schema.sql`) has been run in Supabase SQL Editor
- [ ] Tables `profiles` and `ai_tools` exist in Supabase
- [ ] Row Level Security (RLS) is enabled and working

## ✅ Environment Variables

Prepare these values before deployment:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Dashboard → Settings → API
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard → Settings → API

## ✅ Supabase Configuration

- [ ] Email authentication is enabled in Supabase
- [ ] Email confirmation settings configured (recommended: disable for testing)
- [ ] Redirect URLs will be configured after deployment (in Step 6)

## ✅ Testing Checklist

Test these locally before deploying:

- [ ] Home page loads correctly
- [ ] Sign up flow works
- [ ] Sign in flow works
- [ ] Can submit a workflow
- [ ] Workflows appear on home page
- [ ] Dashboard shows user's workflows
- [ ] Search functionality works

## ✅ Build Test

Run this command locally before deploying:

```bash
cd ai-tools-sharing
npm run build
```

**Expected result**: Build completes successfully without errors.

If build fails, fix errors before deploying.

## ✅ File Structure

Ensure these files exist:

- [ ] `package.json` with all dependencies
- [ ] `next.config.ts` exists
- [ ] `tsconfig.json` exists
- [ ] `.gitignore` includes `.env.local` and `node_modules`
- [ ] `supabase/migrations/001_initial_schema.sql` exists

## 🚀 Ready to Deploy?

Once all items above are checked, proceed to `VERCEL_DEPLOYMENT_GUIDE.md` for step-by-step instructions.

---

**Quick Command to Test Build Locally:**

```bash
cd ai-tools-sharing
npm install
npm run build
```

If this succeeds, you're ready for Vercel deployment! 🎉
