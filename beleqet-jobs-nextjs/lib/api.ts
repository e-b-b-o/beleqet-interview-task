const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function fetchJobs(params?: Record<string, string>) {
  const url = new URL(`${API_URL}/jobs`);
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
  }
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 } // revalidate every 60 seconds
  });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function fetchJobById(id: string) {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch job');
  }
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/jobs/categories`, {
    next: { revalidate: 3600 } // cache categories longer
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchCompanyJobs(companyId: string) {
    const res = await fetch(`${API_URL}/jobs?companyId=${companyId}`, {
        next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error('Failed to fetch company jobs');
    return res.json();
}
