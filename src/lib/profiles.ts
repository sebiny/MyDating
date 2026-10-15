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
  id: number;
  name: string;
  age: number;
  introduction: string;
  image: string;
  job: string;
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

export const profiles: Profile[] = [
  {
    id: 1,
    name: "Sophie",
    age: 25,
    introduction: "Coffee, travel, and little adventures ☕",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
    job: "Designer",
  },
  {
    id: 2,
    name: "Daniel",
    age: 27,
    introduction: "Looking for someone to explore the world with.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600",
    job: "Developer",
  },
  {
    id: 3,
    name: "Emma",
    age: 24,
    introduction: "Book lover, foodie, and weekend explorer 📚",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600",
    job: "Teacher",
  },
  {
    id: 4,
    name: "Alex",
    age: 26,
    introduction: "Music, hiking, and meaningful conversations.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600",
    job: "Photographer",
  },
  {
    id: 5,
    name: "Mia",
    age: 23,
    introduction: "Always searching for a new favorite place.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600",
    job: "Marketing",
  },
  {
    id: 6,
    name: "Noah",
    age: 28,
    introduction: "Gym, good food, and spontaneous road trips.",
    image:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600",
    job: "Engineer",
  },
];