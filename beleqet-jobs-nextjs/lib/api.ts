/**
 * Central API client for the Beleqet frontend.
 *
 * PRODUCTION (Vercel):
 *   Set NEXT_PUBLIC_API_URL in your Vercel project settings to:
 *   https://beleqet-interview-task-1-bt16.onrender.com/api/v1
 *
 * LOCAL DEVELOPMENT:
 *   .env.local  →  NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (process.env.NODE_ENV === 'production'
    ? 'https://beleqet-interview-task-1-bt16.onrender.com/api/v1'
    : 'http://127.0.0.1:4000/api/v1');

// ─── Jobs ──────────────────────────────────────────────────────────────────

export async function fetchJobs(params?: Record<string, string>) {
  const url = new URL(`${API_URL}/jobs`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs (${res.status}): ${url.toString()}`);
  }

  return res.json();
}

export async function fetchJobById(id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch job ${id} (${res.status})`);
  }

  return res.json();
}

// ─── Categories ───────────────────────────────────────────────────────────

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/jobs/categories`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  return res.json();
}

// ─── Company jobs ─────────────────────────────────────────────────────────

export async function fetchCompanyJobs(companyId: string) {
  const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch company jobs (${res.status})`);
  }

  return res.json();
}
