"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("JOB_SEEKER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Registration failed");
      }

      const data = await res.json();
      login(data.accessToken, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pageBg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors px-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-border p-8 sm:p-10 shadow-cardHover">
        <h1 className="text-2xl font-extrabold text-ink text-center mb-6">Create an Account</h1>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brandGreen transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brandGreen transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brandGreen transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brandGreen transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink">I am a...</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-brandGreen bg-white transition-colors"
              >
                <option value="JOB_SEEKER">Job Seeker</option>
                <option value="EMPLOYER">Employer</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3.5 hover:bg-darkGreen transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brandGreen hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
    </div>
  );
}
