"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/browser";

const interestGroups = [
  {
    title: "Creativity",
    interests: [
      "Cooking",
      "Knitting",
      "Art",
      "Anime",
      "Development",
      "Style",
      "Guitar",
      "Piano",
      "Board games",
      "Gaming",
      "Photography",
      "Movies",
    ],
  },
  {
    title: "Sports & Outdoors",
    interests: [
      "Ping-pong",
      "Basketball",
      "Skiing",
      "Walking",
      "Dance",
      "Chess",
      "Swimming",
      "Hiking",
      "Travel",
      "Camping",
    ],
  },
  {
    title: "Lifestyle",
    interests: [
      "Coffee",
      "Reading",
      "Music",
      "Food",
      "Fitness",
      "Pets",
      "Fashion",
      "Nature",
    ],
  },
];

const questions = [
  {
    key: "socialStyle",
    question: "I enjoy meeting new people.",
  },
  {
    key: "communication",
    question: "Good communication is important to me.",
  },
  {
    key: "relationship",
    question: "I'm looking for a meaningful connection.",
  },
];

const options = ["Disagree", "Not sure", "Agree"];

const chipBase =
  "rounded-full border px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#403e91]";

export default function TypeSettingPage() {
  const router = useRouter();

  const [genderPreference, setGenderPreference] = useState("everyone");
  const [minAge, setMinAge] = useState("22");
  const [maxAge, setMaxAge] = useState("35");
  const [interests, setInterests] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleInterest(interest: string) {
    setError("");

    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length >= 10) {
        setError("You can select up to 10 interests.");
        return current;
      }

      return [...current, interest];
    });
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const min = Number(minAge);
    const max = Number(maxAge);

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      min < 18 ||
      max > 100 ||
      min > max
    ) {
      setError("Enter a valid age range between 18 and 100.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in again to finish your profile.");

      const profileBasics = JSON.parse(localStorage.getItem("datingProfile") ?? "{}") as { photo?: string | null };
      const introduction = JSON.parse(localStorage.getItem("datingIntroduction") ?? "{}") as {
        introduction?: string;
        hobbies?: string[];
        lifestyle?: string[];
        relationshipGoal?: string;
      };
      const { error: updateError } = await supabase.from("profiles").update({
        preferred_gender: genderPreference,
        min_age: min,
        max_age: max,
        interests,
        hobbies: introduction.hobbies ?? [],
        lifestyle: introduction.lifestyle ?? [],
        relationship_goal: introduction.relationshipGoal ?? null,
        bio: introduction.introduction ?? null,
        personality: answers,
        is_complete: true,
      }).eq("id", user.id);
      if (updateError) throw updateError;

      localStorage.removeItem("datingProfile");
      localStorage.removeItem("datingIntroduction");
      localStorage.removeItem("datingPreferences");
      router.replace("/home");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5fb] px-4 py-8 text-[#24223b] sm:py-12">
      <form
        onSubmit={handleSave}
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
            Your type, your way.
          </h1>
          <Link href="/onboarding/profile-setup/introduce">Go back</Link>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Tell us who you&apos;re interested in and what you enjoy. Your
          preferences guide discovery; they don&apos;t automatically select
          people for your homepage.
        </p>

        {/* Gender preference */}
        <section className="mt-8">
          <h2 className="font-semibold">Who are you interested in?</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Everyone", value: "everyone" },
              { label: "Women", value: "women" },
              { label: "Men", value: "men" },
              { label: "Non-binary people", value: "non-binary" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={genderPreference === option.value}
                onClick={() => setGenderPreference(option.value)}
                className={`${chipBase} ${
                  genderPreference === option.value
                    ? "border-[#d8ff80] bg-[#d8ff80] text-[#27233c]"
                    : "border-gray-200 bg-white hover:border-[#403e91]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* Age range */}
        <section className="mt-8">
          <h2 className="font-semibold">Preferred age range</h2>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">From</span>
              <input
                type="number"
                min={18}
                max={100}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#403e91]"
              />
            </label>

            <span className="pb-3 text-sm text-gray-400">to</span>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">To</span>
              <input
                type="number"
                min={18}
                max={100}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#403e91]"
              />
            </label>
          </div>
        </section>

        {/* Interests */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Choose your interests</h2>
            <span className="text-sm font-semibold text-[#403e91]">
              {interests.length}/10
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Pick up to 10 things you like.
          </p>

          {interestGroups.map((group) => (
            <div className="mt-6" key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.interests.map((interest) => {
                  const selected = interests.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleInterest(interest)}
                      className={`${chipBase} ${
                        selected
                          ? "border-[#d8ff80] bg-[#d8ff80]"
                          : "border-gray-200 bg-white hover:border-[#403e91]"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Personality questions */}
        <section className="mt-8">
          <h2 className="font-semibold">Personality</h2>

          {questions.map((question, index) => (
            <div key={question.key} className="mt-6">
              <p className="text-sm font-medium leading-6">
                {index + 1}. {question.question}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={answers[question.key] === option}
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.key]: option,
                      }))
                    }
                    className={`${chipBase} ${
                      answers[question.key] === option
                        ? "border-[#d8ff80] bg-[#d8ff80]"
                        : "border-gray-200 bg-white hover:border-[#403e91]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        {error && (
          <p role="alert" className="mt-5 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#d8a7ff] font-semibold text-[#21172d] transition hover:bg-[#c991f7]"
        >
          {saving ? "Saving…" : <>Save & Continue <span aria-hidden="true">→</span></>}
        </button>

        <button
          type="button"
          onClick={() => router.push("/onboarding/profile-setup")}
          className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-[#403e91] hover:bg-[#f6f5fb]"
        >
          Back to profile
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          You can update your preferences later.
        </p>
      </form>
    </main>
  );
}
