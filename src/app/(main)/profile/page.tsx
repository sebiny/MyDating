"use client";

import { initialMyProfile, MyProfile } from "@/src/lib/profiles";
import { SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/browser";
import BottomNavbar from "@/src/components/layout/BottomNavbar";

const fields: {
  key: keyof MyProfile;
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
  const router = useRouter();
  const [profile, setProfile] = useState<MyProfile>(initialMyProfile);
  const [draft, setDraft] = useState<MyProfile>(initialMyProfile);
  const [preferences, setPreferences] = useState({ preferredGender: "everyone", minAge: 18, maxAge: 100 });
  const [draftPreferences, setDraftPreferences] = useState({ preferredGender: "everyone", minAge: 18, maxAge: 100 });
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  const loadProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const { data, error: queryError } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (queryError) throw queryError;
      const nextProfile: MyProfile = {
        name: data.display_name ?? "",
        gender: data.gender ?? "",
        age: data.age == null ? "" : String(data.age),
        location: data.city ?? "",
        occupation: data.occupation ?? "",
        education: data.education ?? "",
        height: data.height ?? "",
        introduction: data.bio ?? "",
        hobbies: (data.hobbies ?? []).join(", "),
        interests: (data.interests ?? []).join(", "),
        relationshipGoal: data.relationship_goal ?? "",
        music: data.music ?? "",
        lifestyle: (data.lifestyle ?? []).join(", "),
      };
      setProfile(nextProfile);
      setDraft(nextProfile);
      setPhotoUrl(data.photo_urls?.[0] ?? "");
      const nextPreferences = { preferredGender: data.preferred_gender ?? "everyone", minAge: data.min_age ?? 18, maxAge: data.max_age ?? 100 };
      setPreferences(nextPreferences);
      setDraftPreferences(nextPreferences);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  function startEditing() {
    setDraft({ ...profile });
    setDraftPreferences({ ...preferences });
    setSavedMessage("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft({ ...profile });
    setIsEditing(false);
  }

  function updateField(key: keyof MyProfile, value: string) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveProfile(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (draftPreferences.minAge < 18 || draftPreferences.maxAge > 100 || draftPreferences.minAge > draftPreferences.maxAge) {
      setError("Choose a valid preferred age range between 18 and 100.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
      const { error: updateError } = await supabase.from("profiles").update({
        display_name: draft.name.trim(),
        age: Number(draft.age),
        gender: draft.gender.toLowerCase() === "woman" || draft.gender.toLowerCase() === "man" || draft.gender.toLowerCase() === "non-binary" ? draft.gender.toLowerCase() : "other",
        city: draft.location.trim(),
        occupation: draft.occupation.trim() || null,
        education: draft.education.trim() || null,
        height: draft.height.trim() || null,
        bio: draft.introduction.trim() || null,
        hobbies: split(draft.hobbies),
        interests: split(draft.interests),
        relationship_goal: draft.relationshipGoal || null,
        music: draft.music.trim() || null,
        lifestyle: split(draft.lifestyle),
        preferred_gender: draftPreferences.preferredGender,
        min_age: draftPreferences.minAge,
        max_age: draftPreferences.maxAge,
      }).eq("id", user.id);
      if (updateError) throw updateError;
      setProfile({ ...draft });
      setPreferences({ ...draftPreferences });
      setIsEditing(false);
      setSavedMessage("Your profile has been updated!");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  }

  const displayedProfile = isEditing ? draft : profile;

  async function updatePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
      setError("Choose an image smaller than 3 MB.");
      return;
    }
    setPhotoSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const nextUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const { error: updateError } = await supabase.from("profiles").update({ photo_urls: [nextUrl] }).eq("id", user.id);
      if (updateError) throw updateError;
      setPhotoUrl(nextUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your photo.");
    } finally {
      setPhotoSaving(false);
    }
  }

  if (loading) return <main className="p-10 text-center text-gray-500">Loading your profile…</main>;

  function renderValue(value: string) {
    return value || "Not added yet";
  }

  return (
    <main className="min-h-screen bg-[#fff8fa] px-4 py-10 pb-28 sm:px-8">
      <div className="mx-auto max-w-4xl">
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
            <div className="flex gap-2">
              <button onClick={startEditing} className="shrink-0 rounded-xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600">Edit profile</button>
              <button onClick={async () => { await createClient().auth.signOut(); router.replace("/login"); router.refresh(); }} className="shrink-0 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Sign out</button>
            </div>
          )}
        </header>

        {/* Profile card */}
        <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">
          <div className="h-32 bg-gradient-to-r from-pink-200 via-rose-100 to-purple-100" />

          <div className="px-6 pb-8 sm:px-10">
            {/* Avatar and name */}
            <div className="-mt-12 mb-8 flex flex-wrap items-end gap-4">
              <button type="button" onClick={() => photoInput.current?.click()} disabled={photoSaving} className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-pink-100 text-4xl disabled:opacity-60" aria-label="Change profile photo">
                {photoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" /> : "🌷"}
                <input ref={photoInput} type="file" accept="image/*" hidden onChange={(event) => void updatePhoto(event.target.files?.[0])} />
              </button>

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
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

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
                        <option value="woman">Woman</option>
                        <option value="man">Man</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Prefer not to say / other</option>
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
                        <option>Long-term relationship</option>
                        <option>Getting to know someone</option>
                        <option>Meaningful connection</option>
                        <option>Friendship first</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-lg font-bold text-gray-900">My type</h3>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                      Interested in
                      <select value={draftPreferences.preferredGender} onChange={(event) => setDraftPreferences((current) => ({ ...current, preferredGender: event.target.value }))} className="h-12 rounded-xl border border-gray-200 bg-white px-4">
                        <option value="everyone">Everyone</option><option value="women">Women</option><option value="men">Men</option><option value="non-binary">Non-binary people</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">Minimum age
                      <input type="number" min={18} max={100} value={draftPreferences.minAge} onChange={(event) => setDraftPreferences((current) => ({ ...current, minAge: Number(event.target.value) }))} className="h-12 rounded-xl border border-gray-200 px-4" />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">Maximum age
                      <input type="number" min={18} max={100} value={draftPreferences.maxAge} onChange={(event) => setDraftPreferences((current) => ({ ...current, maxAge: Number(event.target.value) }))} className="h-12 rounded-xl border border-gray-200 px-4" />
                    </label>
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
                    disabled={saving}
                    className="rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white transition hover:bg-pink-600"
                  >
                    {saving ? "Saving…" : "Save changes"}
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
      <BottomNavbar />
    </main>
  );
}
