"use client";

import Link from "next/link";
import { useState, type SyntheticEvent } from "react";

type AuthFormProps = {
  mode: "signup" | "login";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    // UI only: connect your authentication API here.
    alert(isSignup ? "Sign-up form submitted!" : "Login form submitted!");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f8] px-5 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-pink-100 sm:p-10">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-pink-500"
        >
          dear. ♡
        </Link>

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

          <button
            type="submit"
            className="w-full rounded-xl bg-pink-500 py-3.5 font-semibold text-white transition hover:bg-pink-600 active:scale-[0.99]"
          >
            {isSignup ? "Create account" : "Log in"}
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
