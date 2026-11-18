"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Key, Shield, User, Sparkles } from "lucide-react";
import { APP_NAME } from "@/components/layout/Header";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "AccessDenied"
      ? "Access denied. Admin credentials required for that area."
      : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign-in.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(userEmail: string, userPass: string) {
    setEmail(userEmail);
    setPassword(userPass);
    setError("");
  }

  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-md border border-[var(--line)] bg-[var(--surface)] p-6 shadow-dropdown sm:p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-[var(--brand)] text-sm font-bold text-white mb-2">
            W
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)]">
            Sign in to {APP_NAME}
          </h1>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Access your bookings, saved travellers, and wallet balance.
          </p>
        </div>

        {/* Demo Account Quick-Fill Buttons */}
        <div className="mb-6 rounded border border-[var(--line)] bg-[var(--canvas)] p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
            <span>Demo Credentials (1-Click Fill)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("traveller@demo.test", "Demo1234!")}
              className="flex flex-col items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] p-2 text-center text-xs transition-colors hover:border-[var(--brand)]"
            >
              <User className="h-3.5 w-3.5 text-[var(--brand)] mb-1" />
              <span className="font-semibold text-[11px] text-[var(--ink)]">Traveller</span>
              <span className="text-[9px] text-[var(--ink-muted)]">Active Trips</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("admin@demo.test", "Admin1234!")}
              className="flex flex-col items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] p-2 text-center text-xs transition-colors hover:border-[var(--brand)]"
            >
              <Shield className="h-3.5 w-3.5 text-amber-600 mb-1" />
              <span className="font-semibold text-[11px] text-[var(--ink)]">Admin</span>
              <span className="text-[9px] text-[var(--ink-muted)]">Full Access</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo("new@demo.test", "New1234!")}
              className="flex flex-col items-center justify-center rounded border border-[var(--line)] bg-[var(--surface)] p-2 text-center text-xs transition-colors hover:border-[var(--brand)]"
            >
              <Key className="h-3.5 w-3.5 text-blue-600 mb-1" />
              <span className="font-semibold text-[11px] text-[var(--ink)]">New User</span>
              <span className="text-[9px] text-[var(--ink-muted)]">Fresh State</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-xs font-mono text-[var(--ink)] focus:border-[var(--brand)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>{loading ? "Signing in..." : "Sign In"}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[var(--ink-muted)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-[var(--brand)] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-[var(--ink-muted)]">Loading sign-in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
