export const photos = {
  nurse: "/photos/nurse.jpg",
  hands: "/photos/hands.jpg",
  walker: "/photos/walker.jpg",
  oximeter: "/photos/oximeter.jpg",
  pressure: "/photos/pressure.jpg",
  tea: "/photos/tea.jpg",
  park: "/photos/park.jpg",
} as const;

export type PhotoKey = keyof typeof photos;

export const tabPhoto: Record<string, PhotoKey> = {
  voice: "tea",
  family: "hands",
  safety: "pressure",
  reminders: "walker",
  visits: "oximeter",
  home: "walker",
  help: "park",
};
