"use client";

import { SyntheticEvent, useState } from "react";

type ProfileData = {
  name: string;
  gender: string;
  age: string;
  location: string;
  occupation: string;
  education: string;
  height: string;
  introduction: string;
  hobbies: string;
  interests: string;
  relationshipGoal: string;
  music: string;
  lifestyle: string;
};

const initialProfile: ProfileData = {
  name: "Alex",
  gender: "Woman",
  age: "24",
  location: "Vancouver, Canada",
  occupation: "Frontend Developer",
  education: "University graduate",
  height: "165 cm",
  introduction:
    "I love cozy cafes, discovering new places, and having conversations that last for hours.",
  hobbies: "Cafe hopping, Photography, Hiking",
  interests: "Technology, Movies, Travel",
  relationshipGoal: "A meaningful relationship",
  music: "Indie pop, R&B",
  lifestyle: "Non-smoker, Active on weekends",
};

const fields: {
  key: keyof ProfileData;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { key: "name", label: "Name", placeholder: "Your name" },
  { key: "age", label: "Age", placeholder: "Your age", type: "number" },
  { key: "location", label: "Location", placeholder: "City, country" },
  { key: "occupation", label: "Occupation", placeholder: "Your job" },
  { key: "education", label: "Education", placeholder: "Your education" },
  { key: "height", label: "Height", placeholder: "e.g. 165 cm" },
  {
    key: "hobbies",
    label: "Hobbies",
    placeholder: "Photography, hiking, cooking",
  },
  {
    key: "interests",
    label: "Interests",
    placeholder: "Movies, travel, technology",
  },
  { key: "music", label: "Favorite music", placeholder: "Music you enjoy" },
  {
    key: "lifestyle",
    label: "Lifestyle",
    placeholder: "Your lifestyle preferences",
  },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [draft, setDraft] = useState<ProfileData>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  function startEditing() {
    setDraft({ ...profile });
    setSavedMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft({ ...profile });
    setIsEditing(false);
  }

  function updateField(key: keyof ProfileData, value: string) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function saveProfile(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfile({ ...draft });
    setIsEditing(false);
    setSavedMessage("Your profile has been updated!");
  }

  const displayedProfile = isEditing ? draft : profile;

  function renderValue(value: string) {
    return value || "Not added yet";
  }

  return (
    <main className="min-h-screen bg-[#fff8fa] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page heading */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-pink-500">
              YOUR SPACE ♡
            </p>
            <h1 className="text-3xl font-bold text-gray-900">My profile</h1>
            <p className="mt-2 text-sm text-gray-500">
              Let people get to know the real you.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={startEditing}
              className="shrink-0 rounded-xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
            >
              Edit profile
            </button>
          )}
        </header>

        {/* Profile card */}
        <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-pink-200 via-rose-100 to-purple-100" />

          <div className="px-6 pb-8 sm:px-10">
            {/* Avatar and name */}
            <div className="-mt-12 mb-8 flex flex-wrap items-end gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-pink-100 text-4xl">
                🌷
              </div>

              <div className="pb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {renderValue(displayedProfile.name)}
                  {displayedProfile.age && (
                    <span className="ml-2 font-normal text-gray-500">
                      {displayedProfile.age}
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  📍 {renderValue(displayedProfile.location)}
                </p>
              </div>
            </div>

            {savedMessage && (
              <p
                role="status"
                className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {savedMessage}
              </p>
            )}

            {isEditing ? (
              <form onSubmit={saveProfile} className="space-y-8">
                {/* Basic information */}
                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Basic information
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {fields.slice(0, 6).map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={field.key}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </label>
                        <input
                          id={field.key}
                          type={field.type ?? "text"}
                          min={field.type === "number" ? 18 : undefined}
                          max={field.type === "number" ? 100 : undefined}
                          value={draft[field.key]}
                          onChange={(e) =>
                            updateField(field.key, e.target.value)
                          }
                          required={field.key === "name" || field.key === "age"}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                    ))}

                    <div>
                      <label
                        htmlFor="gender"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        value={draft.gender}
                        onChange={(e) => updateField("gender", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-pink-400"
                      >
                        <option>Woman</option>
                        <option>Man</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="relationshipGoal"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Looking for
                      </label>
                      <select
                        id="relationshipGoal"
                        value={draft.relationshipGoal}
                        onChange={(e) =>
                          updateField("relationshipGoal", e.target.value)
                        }
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-pink-400"
                      >
                        <option>A meaningful relationship</option>
                        <option>Getting to know people</option>
                        <option>Friendship</option>
                        <option>Still figuring it out</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* About me */}
                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    About me
                  </h3>

                  <label
                    htmlFor="introduction"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Introduction
                  </label>
                  <textarea
                    id="introduction"
                    rows={4}
                    maxLength={500}
                    value={draft.introduction}
                    onChange={(e) =>
                      updateField("introduction", e.target.value)
                    }
                    placeholder="Tell people a little about yourself..."
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                  <p className="mt-2 text-right text-xs text-gray-400">
                    {draft.introduction.length}/500
                  </p>
                </section>

                {/* Interests */}
                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Interests and lifestyle
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {fields.slice(6).map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={field.key}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </label>
                        <input
                          id={field.key}
                          value={draft[field.key]}
                          onChange={(e) =>
                            updateField(field.key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Separate hobbies and interests with commas.
                  </p>
                </section>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white transition hover:bg-pink-600"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              /* Read-only profile */
              <div className="space-y-8">
                <section>
                  <h3 className="mb-3 text-lg font-bold text-gray-900">
                    About me
                  </h3>
                  <p className="whitespace-pre-wrap leading-7 text-gray-600">
                    {renderValue(profile.introduction)}
                  </p>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Personal details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["Gender", profile.gender],
                      ["Age", profile.age],
                      ["Location", profile.location],
                      ["Occupation", profile.occupation],
                      ["Education", profile.education],
                      ["Height", profile.height],
                      ["Looking for", profile.relationshipGoal],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-gray-50 p-4">
                        <p className="mb-1 text-xs text-gray-400">{label}</p>
                        <p className="font-medium text-gray-800">
                          {renderValue(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    My interests
                  </h3>

                  {[
                    ["Hobbies", profile.hobbies],
                    ["Interests", profile.interests],
                    ["Favorite music", profile.music],
                    ["Lifestyle", profile.lifestyle],
                  ].map(([label, value]) => (
                    <div key={label} className="mb-5">
                      <p className="mb-3 text-sm font-medium text-gray-500">
                        {label}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean)
                          .map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-pink-50 px-4 py-2 text-sm text-pink-700"
                            >
                              {item}
                            </span>
                          ))}

                        {!value.trim() && (
                          <span className="text-sm text-gray-400">
                            Not added yet
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </section>

                <button
                  onClick={startEditing}
                  className="w-full rounded-xl bg-pink-500 py-3.5 font-semibold text-white transition hover:bg-pink-600 sm:w-auto sm:px-8"
                >
                  Edit my profile
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
