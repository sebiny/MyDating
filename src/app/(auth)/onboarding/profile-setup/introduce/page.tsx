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
  "rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a53e4b]";

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
    <main className="min-h-screen bg-[#f7f4f1] px-4 py-5 text-[#28211f] sm:px-6 sm:py-10">
      <form
        onSubmit={handleContinue}
        className="mx-auto w-full max-w-5xl"
      >
        {/* Progress */}
        <div className="mb-5 flex gap-1.5" aria-label="Step 2 of 3">
          <div className="h-1 flex-1 rounded-full bg-[#a53e4b]" />
          <div className="h-1 flex-1 rounded-full bg-[#a53e4b]" />
          <div className="h-1 flex-1 rounded-full bg-[#e6dfdb]" />
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9a6263]">
          STEP 2 OF 3
        </p>

        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#342624] sm:text-5xl">
            Tell us your story.
          </h1>
          <Link className="shrink-0 text-sm font-semibold text-[#806f6c] transition hover:text-[#a53e4b]" href="/onboarding/profile-setup">← Back</Link>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#806f6c]">
          Go beyond the basics. Let people discover what makes you, you.
        </p>

        {/* Introduction */}
        <section className="mt-6 rounded-[1.5rem] border border-[#eee7e2] bg-white p-5 sm:p-7">
          <div className="mb-4"><h2 className="font-serif text-2xl font-semibold text-[#342624]">Your introduction</h2><p className="mt-1 text-sm text-[#897a75]">A few honest details make a lovely first impression.</p></div>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="introduction" className="font-semibold">
              About me
            </label>

            <span className="text-xs text-[#a1918c]">
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
            className="mt-3 w-full resize-y rounded-2xl border border-[#e8dfda] bg-[#fcfaf8] p-4 text-sm leading-6 outline-none transition placeholder:text-[#aa9c97] focus:border-[#a53e4b] focus:ring-2 focus:ring-[#a53e4b]/10"
          />

          <p className="mt-2 text-xs leading-5 text-[#a1918c]">
            {
              "Share your personality, your passions, or something people wouldn't guess about you."
            }
          </p>
        </section>

        {/* Hobbies */}
        <section className="mt-4 rounded-[1.5rem] border border-[#eee7e2] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">What do you enjoy?</h2>
            <span className="rounded-full bg-[#f7eeeb] px-3 py-1 text-xs font-semibold text-[#9b4d55]">{hobbies.length}/5</span>
          </div>

          <p className="mt-2 text-sm text-[#897a75]">Choose up to 5 hobbies.</p>

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
                      ? "border-[#a53e4b] bg-[#a53e4b] text-white"
                      : "border-[#e8dfda] bg-[#fcfaf8] text-[#594d49] hover:border-[#a53e4b]"
                  }`}
                >
                  {hobby}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lifestyle */}
        <section className="mt-4 rounded-[1.5rem] border border-[#eee7e2] bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Your lifestyle</h2>
            <span className="rounded-full bg-[#f7eeeb] px-3 py-1 text-xs font-semibold text-[#9b4d55]">{lifestyle.length}/3</span>
          </div>

          <p className="mt-2 text-sm text-[#897a75]">
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
                      ? "border-[#a53e4b] bg-[#a53e4b] text-white"
                      : "border-[#e8dfda] bg-[#fcfaf8] text-[#594d49] hover:border-[#a53e4b]"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {/* Relationship goals */}
        <section className="mt-4 rounded-[1.5rem] border border-[#eee7e2] bg-white p-5 sm:p-7">
          <h2 className="font-semibold">What are you looking for?</h2>

          <p className="mt-2 text-sm text-[#897a75]">
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
                      ? "border-[#a53e4b] bg-[#fbf1ef] text-[#8f3440]"
                      : "border-[#e8dfda] hover:border-[#a53e4b]"
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
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a53e4b] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(165,62,75,.8)] transition hover:bg-[#8f3440] sm:mx-auto sm:max-w-sm"
        >
          Continue <span aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/onboarding/profile-setup")}
          className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-[#806f6c] transition hover:bg-white hover:text-[#a53e4b]"
        >
          Back to profile
        </button>

        <p className="mt-3 text-center text-xs text-[#a1918c]">
          You can edit your introduction later.
        </p>
      </form>
    </main>
  );
}
