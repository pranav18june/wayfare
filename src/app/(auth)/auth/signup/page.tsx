"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { UserPlus } from "lucide-react";
import { APP_NAME } from "@/components/layout/Header";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/auth/signin");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during account creation.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-dropdown sm:p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-[var(--brand)] text-sm font-bold text-white mb-2">
            W
          </span>
          <h1 className="text-xl font-bold text-[var(--ink)]">Create a {APP_NAME} Account</h1>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Instant booking, saved traveller autofill, and ₹250 welcome wallet credit.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-[#FAD2CF] bg-[#FCE8E6] p-3 text-xs text-[var(--danger)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="signup-name" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="signup-phone" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Mobile Number (optional)
            </label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold text-[var(--ink-muted)] mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--brand)] text-xs font-semibold text-white transition-colors hover:bg-[var(--brand-ink)] disabled:opacity-50"
          >
            <UserPlus size={15} />
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--ink-muted)]">
          Already registered?{" "}
          <Link href="/auth/signin" className="font-semibold text-[var(--accent)] hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
