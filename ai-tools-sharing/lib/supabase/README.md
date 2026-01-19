# Supabase Client Setup

This directory contains the Supabase client configuration for both client-side and server-side usage.

## Files

- **`client.ts`** - Browser/client-side Supabase client (use in Client Components)
- **`server.ts`** - Server-side Supabase client (use in Server Components, API routes, Server Actions)
- **`types.ts`** - TypeScript types matching your database schema

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from your Supabase Dashboard → Project Settings → API

## Usage Examples

### In Client Components (use client)

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [tools, setTools] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTools() {
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .order('date_uploaded', { ascending: false });

      if (error) {
        console.error('Error fetching tools:', error);
      } else {
        setTools(data);
      }
    }

    fetchTools();
  }, []);

  return <div>{/* Your component */}</div>;
}
```

### In Server Components

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function ServerComponent() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('ai_tools')
    .select('*, profiles(*)')
    .order('date_uploaded', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return <div>Error loading tools</div>;
  }

  return <div>{/* Render your data */}</div>;
}
```

### Authentication Example

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```
