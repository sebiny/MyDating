"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const HOBBIES = [
  "Travel",
  "Cooking",
  "Movies",
  "Music",
  "Reading",
  "Gaming",
  "Photography",
  "Art",
  "Fitness",
  "Hiking",
  "Coffee",
  "Fashion",
  "Pets",
  "Development",
  "Dancing",
];

const LIFESTYLES = [
  "Homebody",
  "Social butterfly",
  "Early bird",
  "Night owl",
  "Fitness lover",
  "Travel enthusiast",
];

const RELATIONSHIP_GOALS = [
  "Long-term relationship",
  "Getting to know someone",
  "Meaningful connection",
  "Friendship first",
];

const chipBase =
  "rounded-full border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#403e91]";

export default function IntroducePage() {
  const router = useRouter();

  const [introduction, setIntroduction] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [relationshipGoal, setRelationshipGoal] = useState("");
  const [error, setError] = useState("");

  function toggleItem(
    item: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>,
    limit: number,
  ) {
    setError("");

    if (selectedItems.includes(item)) {
      setSelectedItems((current) => current.filter((value) => value !== item));
      return;
    }

    if (selectedItems.length >= limit) {
      setError(`You can select up to ${limit} options.`);
      return;
    }

    setSelectedItems((current) => [...current, item]);
  }

  function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (introduction.trim().length < 20) {
      setError("Please write at least 20 characters about yourself.");
      return;
    }

    if (hobbies.length === 0) {
      setError("Please select at least one hobby or interest.");
      return;
    }

    if (!relationshipGoal) {
      setError("Please choose what you're looking for.");
      return;
    }

    try {
      localStorage.setItem(
        "datingIntroduction",
        JSON.stringify({
          introduction: introduction.trim(),
          hobbies,
          lifestyle,
          relationshipGoal,
        }),
      );

      router.push("/onboarding/profile-setup/type");
    } catch {
      setError("Could not save your introduction. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5fb] px-4 py-8 text-[#24223b] sm:py-12">
      <form
        onSubmit={handleContinue}
        className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl shadow-[#302d72]/5 sm:p-10"
      >
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#403e91]" />
          <div className="h-1.5 flex-1 rounded-full bg-[#403e91]" />
          <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
        </div>

        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#403e91]">
          STEP 2 OF 3
        </p>

        <div className="flex justify-between">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tell us your story.
          </h1>
          <Link href="/onboarding/profile-setup">Go back</Link>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Go beyond the basics. Let people discover what makes you, you.
        </p>

        {/* Introduction */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="introduction" className="font-semibold">
              About me
            </label>

            <span className="text-xs text-gray-400">
              {introduction.length}/500
            </span>
          </div>

          <textarea
            id="introduction"
            value={introduction}
            onChange={(event) =>
              setIntroduction(event.target.value.slice(0, 500))
            }
            placeholder="Hi! I enjoy discovering new cafes, traveling, and having conversations that last for hours..."
            rows={5}
            maxLength={500}
            required
            className="mt-3 w-full resize-y rounded-2xl border border-gray-200 p-4 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#403e91] focus:ring-2 focus:ring-[#403e91]/10"
          />

          <p className="mt-2 text-xs leading-5 text-gray-400">
            {
              "Share your personality, your passions, or something people wouldn't guess about you."
            }
          </p>
        </section>

        {/* Hobbies */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">What do you enjoy?</h2>
            <span className="text-xs text-gray-400">{hobbies.length}/5</span>
          </div>

          <p className="mt-2 text-sm text-gray-500">Choose up to 5 hobbies.</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {HOBBIES.map((hobby) => {
              const selected = hobbies.includes(hobby);

              return (
                <button
                  key={hobby}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleItem(hobby, hobbies, setHobbies, 5)}
                  className={`${chipBase} ${
                    selected
                      ? "border-[#d8ff80] bg-[#d8ff80]"
                      : "border-gray-200 bg-white hover:border-[#403e91]"
                  }`}
                >
                  {hobby}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lifestyle */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Your lifestyle</h2>
            <span className="text-xs text-gray-400">{lifestyle.length}/3</span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Pick up to 3 that describe you.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {LIFESTYLES.map((item) => {
              const selected = lifestyle.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleItem(item, lifestyle, setLifestyle, 3)}
                  className={`${chipBase} ${
                    selected
                      ? "border-[#d8ff80] bg-[#d8ff80]"
                      : "border-gray-200 bg-white hover:border-[#403e91]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {/* Relationship goals */}
        <section className="mt-8">
          <h2 className="font-semibold">What are you looking for?</h2>

          <p className="mt-2 text-sm text-gray-500">
            Choose what best describes your intentions.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RELATIONSHIP_GOALS.map((goal) => {
              const selected = relationshipGoal === goal;

              return (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRelationshipGoal(goal)}
                  className={`rounded-2xl border p-4 text-left text-sm font-medium transition ${
                    selected
                      ? "border-[#403e91] bg-[#f0efff] text-[#403e91]"
                      : "border-gray-200 hover:border-[#403e91]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    {goal}
                    <span>{selected ? "✓" : ""}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <p role="alert" className="mt-5 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Navigation */}
        <button
          type="submit"
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d8a7ff] font-semibold text-[#21172d] transition hover:bg-[#c991f7]"
        >
          Continue <span aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/profile-setup")}
          className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-[#403e91] hover:bg-[#f6f5fb]"
        >
          Back to profile
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          You can edit your introduction later.
        </p>
      </form>
    </main>
  );
}
