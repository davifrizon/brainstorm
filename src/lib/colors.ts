export const NOTE_COLORS = [
  { name: "Butter", value: "#fde68a" },
  { name: "Peach", value: "#fbcaa8" },
  { name: "Blush", value: "#f7b8c4" },
  { name: "Lilac", value: "#d9c8f5" },
  { name: "Sky", value: "#b8dcf5" },
  { name: "Mint", value: "#b7e8d3" },
  { name: "Sage", value: "#c9dba6" },
  { name: "Sand", value: "#e8ddc6" },
] as const;

export function randomNoteColor(): string {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].value;
}

// Vivid, distinguishable colors for cursors / avatars rings.
export const PRESENCE_COLORS = [
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#fb7185",
  "#38bdf8",
  "#facc15",
];

export function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

export const FRAME_COLORS = [
  "#8b8fa3",
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#fb7185",
];
