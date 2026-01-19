# Vercel Deployment Settings

## 📁 Project Structure

Your Next.js app is in a **subdirectory**:
```
/Users/ajitha3008/Desktop/AiToolsSharing/
└── ai-tools-sharing/          ← Your Next.js app is here
    ├── app/
    ├── components/
    ├── lib/
    ├── package.json
    └── next.config.ts
```

---

## ⚙️ Vercel Configuration Settings

When importing your project to Vercel, use these settings:

### Root Directory
```
./ai-tools-sharing
```
**Important**: Since your Next.js app is in a subdirectory, you **MUST** set this!

### Build Command
```
npm run build
```
(Or leave blank - Vercel will auto-detect this)

### Output Directory
```
.next
```
(Leave as default - Next.js always outputs to `.next`)

### Install Command
```
npm install
```
(Or leave blank - Vercel will auto-detect this)

### Development Command (for local testing only)
```
npm run dev
```
**Note**: Vercel doesn't use this for deployment - it's just for local development testing.

---

## 🎯 Quick Setup in Vercel

1. **Import Project** → Select your GitHub repository
2. **Framework Preset**: Next.js (auto-detected)
3. **Root Directory**: `./ai-tools-sharing` ⚠️ **SET THIS!**
4. **Build Command**: `npm run build` (or leave default)
5. **Output Directory**: `.next` (or leave default)
6. **Install Command**: `npm install` (or leave default)

**All other settings can be left as defaults!**

---

## ✅ Verification

After setting Root Directory to `./ai-tools-sharing`, Vercel should:
- ✅ Find `package.json` in the correct location
- ✅ Auto-detect Next.js framework
- ✅ Use correct build/output directories automatically

---

## 🔍 How to Check in Vercel

After deployment, verify:
1. Go to **Project Settings** → **General**
2. Check **Root Directory** shows: `./ai-tools-sharing`
3. Build logs should show: `npm run build` running from `ai-tools-sharing/` directory
