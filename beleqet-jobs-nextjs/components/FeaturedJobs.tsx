import Link from "next/link";
import JobCard from "./JobCard";
import { fetchJobs } from "@/lib/api";

export default async function FeaturedJobs() {
  let featured = [];
  try {
    const data = await fetchJobs({ limit: '5' });
    // Filter featured ones or just use the first 5 if none are featured
    featured = data.items.filter((j: any) => j.featured).slice(0, 5);
    if (featured.length === 0) {
      featured = data.items.slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to fetch featured jobs:", error);
    return (
      <section className="bg-white border-y border-border">
        <div className="container-page py-14">
           <h2 className="text-sectionH2">Featured Jobs</h2>
           <p className="text-red-500 mt-4">Failed to load jobs. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!featured || featured.length === 0) {
     return null; // Empty state: Hide the section if no jobs
  }

  return (
    <section className="bg-white border-y border-border">
      <div className="container-page py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-sectionH2">Featured Jobs</h2>
            <p className="text-muted text-sm mt-1">Fresh opportunities from companies hiring right now.</p>
          </div>
          <Link href="/jobs" className="hidden sm:inline-block text-sm font-semibold text-brandGreen hover:underline shrink-0">
            View all jobs →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {featured.map((job: any) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </section>
  );
}
