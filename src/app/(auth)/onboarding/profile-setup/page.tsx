"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/browser";

export default function ProfileSetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const photoFileRef = useRef<File | null>(null);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Please choose an image smaller than 3 MB.");
      return;
    }

    setError("");
    photoFileRef.current = file;

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  async function handleContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numericAge = Number(age);

    if (
      !name.trim() ||
      !gender ||
      !location.trim() ||
      !Number.isInteger(numericAge) ||
      numericAge < 18 ||
      numericAge > 100
    ) {
      setError("Please complete all fields with valid information.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in again to continue.");

      let photoUrl: string | null = null;
      if (photoFileRef.current) {
        const file = photoFileRef.current;
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        photoUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }

      const genderValue = gender === "woman" || gender === "man" || gender === "non-binary"
        ? gender
        : "other";
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: name.trim(),
        age: numericAge,
        gender: genderValue,
        city: location.trim(),
        ...(photoUrl ? { photo_urls: [photoUrl] } : {}),
      });
      if (profileError) throw profileError;

      localStorage.setItem(
        "datingProfile",
        JSON.stringify({
          photo: photoUrl,
          name: name.trim(),
          age: numericAge,
          gender,
          location: location.trim(),
        }),
      );

      router.push("/onboarding/profile-setup/introduce");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f5fb] px-4 py-8 text-[#24223b] sm:py-12">
      <form
        onSubmit={handleContinue}
        className="mx-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl shadow-[#302d72]/5 sm:p-10"
      >
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#403e91]" />
          <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
          <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
        </div>

        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#403e91]">
          STEP 1 OF 3
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s start with you.
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          Create your profile and let people get to know you.
        </p>

        {/* Profile photo */}
        <div className="my-8 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#c9c5e4] bg-[#f2f0fc] text-sm text-[#403e91] transition hover:border-[#403e91] sm:h-40 sm:w-40"
            aria-label="Upload profile photo"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-2">
                <span className="text-3xl">＋</span>
                Add photo
              </span>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handlePhotoChange}
          />

          <p className="mt-3 text-xs text-gray-500">
            Choose a photo that feels like you.
          </p>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Display name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              maxLength={30}
              required
              className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#403e91] focus:ring-2 focus:ring-[#403e91]/10"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Age *</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="18 or older"
              min={18}
              max={100}
              required
              className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#403e91] focus:ring-2 focus:ring-[#403e91]/10"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Gender *</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#403e91] focus:ring-2 focus:ring-[#403e91]/10"
            >
              <option value="">Select your gender</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
              <option value="non-binary">Non-binary</option>
              <option value="self-describe">Prefer to self-describe</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Location *</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Vancouver, Canada"
              maxLength={80}
              required
              className="h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-[#403e91] focus:ring-2 focus:ring-[#403e91]/10"
            />
          </label>
        </div>

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
          {saving ? "Saving…" : <>Continue <span aria-hidden="true">→</span></>}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Your story starts with the basics.
        </p>
      </form>
    </main>
  );
}
