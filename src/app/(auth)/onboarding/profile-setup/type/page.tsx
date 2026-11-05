"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/browser";

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
const appearanceTypes = [
  "Cute",
  "Sexy",
  "Chic",
  "Casual",
  "Tomboy",
  "Muscular",
  "Skinny",
  "Tall",
  "Short",
];
const personalityTypes = [
  "Calm",
  "Confident",
  "Good listener",
  "Soft spoken",
  "Funny",
  "Thoughtful",
  "Adventurous",
];
const datingStyles = [
  "Going out",
  "Staying in",
  "Exercising together",
  "Trying new food",
  "Travel",
  "Quiet dates",
];
const questionEmojis: Record<string, string> = {
  "Who are you interested in?": "💞",
  "Preferred age range": "🎂",
  "Build your type": "💗",
  "Your appearance style": "😎",
  "Your personality": "✨",
  "Date styles you’d enjoy together": "☕",
  "Appearance you like": "💘",
  "Personality you like": "💕",
  "A little more about you": "💬",
};

const chipBase =
  "rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a53e4b]";

export default function TypeSettingPage() {
  const router = useRouter();

  const [genderPreference, setGenderPreference] = useState("everyone");
  const [minAge, setMinAge] = useState("22");
  const [maxAge, setMaxAge] = useState("35");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [appearance, setAppearance] = useState<string[]>([]);
  const [personalityTags, setPersonalityTags] = useState<string[]>([]);
  const [datingStyle, setDatingStyle] = useState<string[]>([]);
  const [preferredAppearance, setPreferredAppearance] = useState<string[]>([]);
  const [preferredPersonality, setPreferredPersonality] = useState<string[]>(
    [],
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const preferredCount =
    preferredAppearance.length +
    preferredPersonality.length +
    datingStyle.length;

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        throw new Error("Please sign in again to finish your profile.");

      const profileBasics = JSON.parse(
        localStorage.getItem("datingProfile") ?? "{}",
      ) as { photo?: string | null };
      const introduction = JSON.parse(
        localStorage.getItem("datingIntroduction") ?? "{}",
      ) as {
        introduction?: string;
        hobbies?: string[];
        lifestyle?: string[];
        relationshipGoal?: string;
      };
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          preferred_gender: genderPreference,
          min_age: min,
          max_age: max,
          hobbies: introduction.hobbies ?? [],
          lifestyle: introduction.lifestyle ?? [],
          relationship_goal: introduction.relationshipGoal ?? null,
          bio: introduction.introduction ?? null,
          personality: answers,
          appearance,
          personality_tags: personalityTags,
          dating_style: datingStyle,
          preferred_appearance: preferredAppearance,
          preferred_personality: preferredPersonality,
          is_complete: true,
        })
        .eq("id", user.id);
      if (updateError) throw updateError;

      localStorage.removeItem("datingProfile");
      localStorage.removeItem("datingIntroduction");
      localStorage.removeItem("datingPreferences");
      router.replace("/home");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save your preferences. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4f1] px-4 py-5 text-[#28211f] sm:px-6 sm:py-10">
      <form onSubmit={handleSave} className="mx-auto w-full max-w-5xl">
        <>
          {/* Progress */}
          <div className="mb-5 flex gap-1.5" aria-label="Step 3 of 3">
            <div className="h-1 flex-1 rounded-full bg-[#a53e4b]" />
            <div className="h-1 flex-1 rounded-full bg-[#a53e4b]" />
            <div className="h-1 flex-1 rounded-full bg-[#a53e4b]" />
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9a6263]">
            STEP 3 OF 3
          </p>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#342624] sm:text-5xl">
              Your type, your way.
            </h1>
            <Link
              className="shrink-0 text-sm font-semibold text-[#806f6c] transition hover:text-[#a53e4b]"
              href="/onboarding/profile-setup/introduce"
            >
              ← Back
            </Link>
          </div>

          <section className="relative mt-6 overflow-hidden rounded-[1.75rem] bg-[#eee5dd] p-6 text-[#342624] sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-8 h-36 w-36 rounded-full border border-white/10" />
            <div className="relative grid items-center gap-7 sm:grid-cols-[1fr_0.8fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#9e5d5a]">
                  <span className="h-2 w-2 rounded-full bg-[#a53e4b]" /> BUILT
                  AROUND YOU
                </span>
                <h2 className="mt-4 max-w-md font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                  Meet people who match your type.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#71615d]">
                  Choose the qualities you’re drawn to. Discovery ranks people
                  by how well their appearance, personality, and date style fit
                  your preferences.
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex -space-x-2" aria-hidden="true">
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#a53e4b] bg-[#f2b9bd] text-sm">
                      ♡
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#a53e4b] bg-[#a53e4b] text-sm text-[#292553]">
                      ✦
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#a53e4b] bg-[#d9c7ff] text-sm">
                      ♡
                    </span>
                  </div>
                  <span className="text-xs text-[#806f6c]">
                    Thoughtful preferences. Better discovery.
                  </span>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[420px]">
                <figure className="overflow-hidden rounded-[1.35rem] border-[5px] border-white bg-white shadow-[0_18px_40px_-20px_rgba(52,38,36,.45)]">
                  <img
                    src="/type-match-profiles.png"
                    alt="Dating profile examples shown in the discovery feed"
                    className="block aspect-square w-full object-contain"
                  />
                </figure>
                <div className="mt-3 rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#806f6c]">
                      Example type match
                    </span>
                    <span className="font-serif text-2xl font-bold leading-none text-[#a53e4b]">
                      85%
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#806f6c]">
                    When you choose type qualities, profiles below 85% will not
                    appear in your curated matches.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Gender preference */}
          <section className="mt-8 rounded-2xl border border-[#eee7e2] bg-[#ffffff] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7eeeb] text-sm font-bold text-[#9b4d55]">
                01
              </span>
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true">
                    {questionEmojis["Who are you interested in?"]}
                  </span>
                  Who are you interested in?
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Your matches should fit each other’s preferences.
                </p>
              </div>
            </div>

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
                      ? "border-[#a53e4b] bg-[#a53e4b] text-[#ffffff]"
                      : "border-[#e8dfda] bg-white text-[#594d49] hover:border-[#a53e4b]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Age range */}
          <section className="mt-5 rounded-2xl border border-[#eee7e2] bg-[#ffffff] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7eeeb] text-sm font-bold text-[#9b4d55]">
                02
              </span>
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true">
                    {questionEmojis["Preferred age range"]}
                  </span>
                  Preferred age range
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Choose the ages you’d like to meet.
                </p>
              </div>
            </div>

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
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#a53e4b]"
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
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#a53e4b]"
                />
              </label>
            </div>
          </section>

          {/* Self descriptors and ideal-type preferences */}
          <section className="mt-5 rounded-2xl border border-[#eee7e2] bg-[#ffffff] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7eeeb] text-sm font-bold text-[#9b4d55]">
                  03
                </span>
                <div>
                  <h2 className="flex items-center gap-2 font-semibold">
                    <span aria-hidden="true">
                      {questionEmojis["Build your type"]}
                    </span>
                    Build your type
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    What you’re drawn to, and a little about you.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#eeecfa] px-3 py-1.5 text-xs font-semibold text-[#9b4d55]">
                {preferredCount} qualities picked
              </span>
            </div>
            <p className="mt-4 rounded-xl border border-[#e9e6f5] bg-white px-4 py-3 text-sm leading-6 text-gray-600">
              Choose appearance and personality qualities you want in a person.
              Pick date styles you’d enjoy together; a date style counts when
              both profiles select it. Discovery shows profiles matching at
              least <strong className="text-[#a53e4b]">20%</strong> of your
              choices.
            </p>
            {(
              [
                [
                  "Your appearance style",
                  appearanceTypes,
                  appearance,
                  setAppearance,
                ],
                [
                  "Your personality",
                  personalityTypes,
                  personalityTags,
                  setPersonalityTags,
                ],
                [
                  "Appearance you like",
                  appearanceTypes,
                  preferredAppearance,
                  setPreferredAppearance,
                ],
                [
                  "Personality you like",
                  personalityTypes,
                  preferredPersonality,
                  setPreferredPersonality,
                ],
                [
                  "Date styles you’d enjoy together",
                  datingStyles,
                  datingStyle,
                  setDatingStyle,
                ],
              ] as [
                string,
                string[],
                string[],
                React.Dispatch<React.SetStateAction<string[]>>,
              ][]
            ).map(([title, choices, selected, setter]) => (
              <div
                key={title}
                className="rounded-xl border border-[#eee7e2] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span aria-hidden="true">{questionEmojis[title]}</span>
                    {title}
                  </h3>
                  <span className="text-xs tabular-nums text-gray-400">
                    {selected.length} selected
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      aria-pressed={selected.includes(choice)}
                      onClick={() =>
                        setter((current) =>
                          current.includes(choice)
                            ? current.filter((item) => item !== choice)
                            : [...current, choice],
                        )
                      }
                      className={`${chipBase} ${selected.includes(choice) ? "border-[#a53e4b] bg-[#a53e4b] text-white" : "border-[#e8dfda] bg-white text-[#594d49] hover:border-[#a53e4b]"}`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Personality questions */}
          <section className="mt-5 rounded-2xl border border-[#eee7e2] bg-[#ffffff] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7eeeb] text-sm font-bold text-[#9b4d55]">
                04
              </span>
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true">
                    {questionEmojis["A little more about you"]}
                  </span>
                  A little more about you
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  A few quick answers help us understand your style.
                </p>
              </div>
            </div>

            {questions.map((question, index) => (
              <div key={question.key} className="mt-6">
                <p className="text-sm font-medium leading-6">
                  <span aria-hidden="true">{["👋", "💬", "💖"][index]}</span>{" "}
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
                          ? "border-[#a53e4b] bg-[#a53e4b] text-white"
                          : "border-[#e8dfda] bg-white text-[#594d49] hover:border-[#a53e4b]"
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
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a53e4b] font-semibold text-white shadow-[0_8px_20px_-10px_rgba(165,62,75,.8)] transition hover:bg-[#8f3440]"
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                Save & Continue <span aria-hidden="true">→</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/onboarding/profile-setup")}
            className="mt-3 w-full rounded-full py-3 text-sm font-semibold text-[#a53e4b] hover:bg-[#f7f4f1]"
          >
            Back to profile
          </button>

          <p className="mt-3 text-center text-xs text-[#a1918c]">
            You can update your preferences later.
          </p>
        </>
      </form>
    </main>
  );
}
