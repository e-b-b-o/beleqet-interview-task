"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { fetchCategories } from "@/lib/api";

export default function PostJobPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("FULL_TIME");
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "EMPLOYER")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchCategories()
      .then(data => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch(err => console.error("Failed to load categories"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          location,
          description,
          categoryId,
          type,
          tags: []
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to post job");
      }

      setSuccess(true);
      setTitle("");
      setLocation("");
      setDescription("");
      setType("FULL_TIME");
      if (categories.length > 0) setCategoryId(categories[0].id);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container-page py-20 text-center text-muted">Checking authentication...</div>;
  }

  if (!user || user.role !== "EMPLOYER") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container-page py-16 max-w-2xl">
      <h1 className="text-pageH1">Post a Job</h1>
      <p className="text-muted mt-4 leading-relaxed">
        Reach thousands of verified job seekers across Ethiopia. Fill out the form below to publish your listing.
      </p>

      {success && (
        <div className="mt-6 bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-200">
          Job posted successfully! It is now live on the platform.
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-200">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-2xl border border-border bg-white p-7 space-y-4"
      >
        <div>
          <label className="text-xs font-semibold text-ink">Job Title</label>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Job Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen bg-white"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Location</label>
          <input 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" 
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink">Job Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5} 
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-50 mt-4"
        >
          {isSubmitting ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
