# AI Tools Sharing Platform

A community-driven platform for discovering and sharing practical AI tool workflows. Built with Next.js 16, React 19, Supabase, and Tailwind CSS.

## Features

- 🔐 User authentication (sign up, sign in, sign out)
- 📝 Submit AI tool workflows with use cases, ratings, and hashtags
- 🔍 Search and discover workflows shared by the community
- 👤 Personal dashboard to view your submitted workflows
- 🌙 Dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migration in Supabase SQL Editor (see `supabase/migrations/001_initial_schema.sql`)

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## App screenshots

<img width="1699" height="945" alt="Screenshot 2026-01-26 at 12 40 31 PM" src="https://github.com/user-attachments/assets/d37c573b-d9f7-4774-a767-e9ac833e1b38" />
<img width="1701" height="961" alt="Screenshot 2026-01-26 at 12 40 46 PM" src="https://github.com/user-attachments/assets/c2bf8669-343f-4357-ab27-e6ddcba4eb06" />
<img width="1697" height="886" alt="Screenshot 2026-01-26 at 12 41 25 PM" src="https://github.com/user-attachments/assets/b114fe4a-8880-4099-b775-fa496d307ed8" />
<img width="1697" height="957" alt="Screenshot 2026-01-26 at 12 41 39 PM" src="https://github.com/user-attachments/assets/e855966e-205a-41ad-89a0-4ae2cd7e929c" />

## Deployment

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Project Structure

```
app/
  ├── about/          # About page
  ├── auth/           # Authentication pages and callbacks
  ├── dashboard/      # User dashboard
  ├── submit/         # Submit workflow page
  └── page.tsx        # Home page
components/
  └── auth/           # Authentication components
lib/
  └── supabase/       # Supabase client configuration
supabase/
  ├── migrations/     # Database migrations
  └── helpers/        # SQL helper queries
```

## License

Private project
