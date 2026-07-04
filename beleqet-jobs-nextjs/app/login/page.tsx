"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("hr@takacash.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      login(data.accessToken, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-page py-16 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 shadow-cardHover">
        <h1 className="text-2xl font-bold text-ink text-center mb-6">Welcome Back</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen transition-colors disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link href="/register" className="text-brandGreen hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
