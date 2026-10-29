"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";
import { createClient } from "@/src/lib/supabase/browser";

type AuthFormProps = {
  mode: "signup" | "login";
};

function describeAuthError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : "Authentication failed. Please try again.";
  if (/over_email_send_rate_limit|email rate limit exceeded/i.test(message)) {
    return "Supabase temporarily blocked another email because too many were requested. Wait for the limit to reset. For public signups, the project owner needs to configure custom SMTP in Supabase.";
  }
  if (/email address not authorized/i.test(message)) {
    return "Supabase's test email sender only delivers to authorized project team addresses. The project owner needs to configure custom SMTP for public signups.";
  }
  return message;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendPromptOpen, setResendPromptOpen] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    setShowResend(false);
    setResendPromptOpen(false);
    setSubmitting(true);

    try {
      const supabase = createClient();
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() },
            // The confirmation link returns to the same host where signup began (local or Vercel).
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          // With email confirmation enabled, new signups also have no session yet.
          // Supabase may also mask whether an email already has an account, so give both paths clearly.
          setNotice("Check your email for a confirmation link. If it doesn’t arrive, check spam or request another link below.");
          setShowResend(true);
        } else {
          router.replace("/onboarding/profile-setup");
          router.refresh();
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace("/home");
        router.refresh();
      }
    } catch (cause) {
      setError(describeAuthError(cause));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendConfirmation() {
    if (!email.trim() || resending) return;
    setError("");
    setNotice("");
    setResending(true);
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) throw resendError;
      setNotice("If this email has a pending confirmation, a new link has been requested. Check your inbox and spam folder.");
    } catch (cause) {
      setError(describeAuthError(cause));
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f8] px-5 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-pink-100 sm:p-10">
        <div className="flex justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-pink-500"
          >
            dear. ♡
          </Link>
        </div>
        <div className="mb-8 mt-8">
          <p className="mb-2 text-sm font-medium text-pink-400">
            YOUR STORY STARTS HERE
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            {isSignup ? "Meet someone new." : "Welcome back."}
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {isSignup
              ? "Create your account and start making meaningful connections."
              : "Sign in to continue your journey."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Your name
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
            />
            {isSignup && (
              <p className="mt-2 text-xs text-gray-400">
                Use at least 8 characters.
              </p>
            )}
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {notice && <div role="status" className="space-y-2 text-sm text-emerald-700">
            <p>{notice}</p>
            {isSignup && <Link href="/login" className="inline-flex font-semibold text-pink-600 underline underline-offset-2">Go to login</Link>}
          </div>}
          {isSignup && showResend && (
            <div className="space-y-2 text-center">
              <button
                type="button"
                onClick={() => setResendPromptOpen((open) => !open)}
                className="text-sm font-medium text-gray-600 underline underline-offset-2"
              >
                {resendPromptOpen ? "Hide confirmation options" : "Still waiting for a confirmation email?"}
              </button>
              {resendPromptOpen && <button
                type="button"
                onClick={() => void resendConfirmation()}
                disabled={resending || !email.trim()}
                className="block w-full text-sm font-semibold text-pink-600 underline underline-offset-2 disabled:opacity-50"
              >
                {resending ? "Requesting link…" : "Send another confirmation link"}
              </button>}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-pink-500 py-3.5 font-semibold text-white transition hover:bg-pink-600 active:scale-[0.99]"
          >
            {submitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-semibold text-pink-500 hover:text-pink-600"
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-gray-400">
          Made for meaningful connections ♡
        </p>
      </div>
    </main>
  );
}
