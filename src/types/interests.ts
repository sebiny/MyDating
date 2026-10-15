export type IncomingInterest = {
  id: number;
  message: string;
  time: string;
};

export const incomingInterests: IncomingInterest[] = [
  {
    id: 1,
    message: "Hey! I loved your profile. How's your week going? 😊",
    time: "10 min ago",
  },
  {
    id: 2,
    message: "You seem like someone I'd love to get to know!",
    time: "30 min ago",
  },
  {
    id: 3,
    message: "Hi! We have so many interests in common.",
    time: "1 hour ago",
  },
  {
    id: 4,
    message: "Hey there! What's your favorite weekend activity?",
    time: "2 hours ago",
  },
];