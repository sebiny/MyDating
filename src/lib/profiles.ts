export type MyProfile = {
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

export type Profile = {
  id: string;
  name: string;
  age: number;
  introduction: string;
  image: string;
  job: string;
  city?: string;
  interests?: string[];
  intro?:string;
};

export const initialMyProfile: MyProfile = {
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

type ProfileRow = {
  id: string;
  display_name: string;
  age: number;
  bio: string | null;
  photo_urls: string[];
  occupation: string | null;
  city: string | null;
  interests: string[];
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.display_name,
    age: row.age,
    introduction: row.bio ?? "",
    image: row.photo_urls?.[0] ?? "/window.svg",
    job: row.occupation ?? "",
    city: row.city ?? undefined,
    interests: row.interests ?? [],
  };
}

export async function getCuratedProfiles() {
  const { createClient } = await import("@/src/lib/supabase/browser");
  const { data, error } = await createClient().rpc("discover_profiles");
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(toProfile);
}

export async function getSelectedProfiles(ids: string[]) {
  if (!ids.length) return [];
  const { createClient } = await import("@/src/lib/supabase/browser");
  const { data, error } = await createClient()
    .from("profiles")
    .select("id,display_name,age,bio,photo_urls,occupation,city,interests")
    .in("id", ids);
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(toProfile);
}
