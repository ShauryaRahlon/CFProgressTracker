# API Integration Guide

Currently, this frontend uses a mock API implementation located in `src/lib/mock-api.ts`.
To connect to the actual backend, follow these steps:

## 1. Configure Environment Variables
Ensure you have the backend URL configured in your `.env.local` file (create it if it doesn't exist):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 2. Create Real API Utilities
Create a new file `src/lib/api.ts` (or replace `mock-api.ts`) with actual `fetch` calls.

Example implementation:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getContests({ page = 1, type = 'All' }) {
  const res = await fetch(`${API_URL}/contests?page=${page}&type=${encodeURIComponent(type)}`, {
    cache: 'no-store' // or 'force-cache' based on requirements
  });
  if (!res.ok) throw new Error('Failed to fetch contests');
  return res.json();
}

export async function getContest(id: number) {
  const res = await fetch(`${API_URL}/contest/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contest');
  return res.json();
}

export async function getStudent(handle: string) {
  const res = await fetch(`${API_URL}/student/${handle}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
```

## 3. Update Components
Go to the page components (`src/app/dashboard/page.tsx`, `src/app/contest/[id]/page.tsx`, `src/app/student/[handle]/page.tsx`) and update the import statement:

```diff
- import { getContests } from "@/lib/mock-api"
+ import { getContests } from "@/lib/api"
```

## 4. Verify Data Types
Ensure the backend JSON response matches the TypeScript interfaces defined in `src/lib/mock-api.ts`. If the backend response structure differs, update the types accordingly.
