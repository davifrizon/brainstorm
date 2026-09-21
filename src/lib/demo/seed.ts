import { nanoid } from "nanoid";
import type {
  ActivityItem,
  Board,
  BoardMember,
  Comment,
  Connection,
  Frame,
  Profile,
} from "@/types";

export const DEMO_USER_ID = "demo-me";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

export const demoProfiles: Profile[] = [
  {
    id: DEMO_USER_ID,
    username: "voce",
    displayName: "Você",
    avatarUrl: null,
    status: "explorando o modo demo",
    onboarded: true,
  },
  {
    id: "lucas",
    username: "lucas",
    displayName: "Lucas",
    avatarUrl: null,
    status: "sempre com uma ideia terrível",
    onboarded: true,
  },
  {
    id: "pedro",
    username: "pedro",
    displayName: "Pedro",
    avatarUrl: null,
    status: "organizando o caos",
    onboarded: true,
  },
  {
    id: "maria",
    username: "maria",
    displayName: "Maria",
    avatarUrl: null,
    status: "🔥 nas ideias malucas",
    onboarded: true,
  },
  {
    id: "ana",
    username: "ana",
    displayName: "Ana",
    avatarUrl: null,
    status: null,
    onboarded: true,
  },
  {
    id: "rafa",
    username: "rafa",
    displayName: "Rafa",
    avatarUrl: null,
    status: "café > sono",
    onboarded: true,
  },
];

export const DEMO_BOARD_ID = "weekend-brainstorm";
const TRIP_BOARD_ID = "trip-ideas";
const BIZ_BOARD_ID = "new-business";
const BUILD_BOARD_ID = "things-to-build";
const RANDOM_BOARD_ID = "random-ideas";

export const demoBoards: Board[] = [
  {
    id: DEMO_BOARD_ID,
    name: "Weekend Brainstorm",
    emoji: "🧠",
    ownerId: "lucas",
    isDemo: true,
    createdAt: minutesAgo(60 * 24 * 3),
    updatedAt: minutesAgo(4),
  },
  {
    id: TRIP_BOARD_ID,
    name: "Trip Ideas",
    emoji: "✈️",
    ownerId: DEMO_USER_ID,
    isDemo: true,
    createdAt: minutesAgo(60 * 24 * 10),
    updatedAt: minutesAgo(60 * 6),
  },
  {
    id: BIZ_BOARD_ID,
    name: "New Business Ideas",
    emoji: "💡",
    ownerId: "maria",
    isDemo: true,
    createdAt: minutesAgo(60 * 24 * 20),
    updatedAt: minutesAgo(60 * 30),
  },
  {
    id: BUILD_BOARD_ID,
    name: "Things We Should Build",
    emoji: "🛠️",
    ownerId: "pedro",
    isDemo: true,
    createdAt: minutesAgo(60 * 24 * 5),
    updatedAt: minutesAgo(60 * 2),
  },
  {
    id: RANDOM_BOARD_ID,
    name: "Random Ideas",
    emoji: "🎲",
    ownerId: DEMO_USER_ID,
    isDemo: true,
    createdAt: minutesAgo(60 * 24 * 40),
    updatedAt: minutesAgo(60 * 24 * 2),
  },
];

function membersFor(boardId: string, ids: string[]): BoardMember[] {
  return ids.map((id, i) => ({
    boardId,
    userId: id,
    role: i === 0 ? "owner" : "member",
    joinedAt: minutesAgo(60 * 24 * 3),
  }));
}

export const demoBoardMembers: BoardMember[] = [
  ...membersFor(DEMO_BOARD_ID, ["lucas", DEMO_USER_ID, "pedro", "maria", "ana"]),
  ...membersFor(TRIP_BOARD_ID, [DEMO_USER_ID, "rafa", "maria"]),
  ...membersFor(BIZ_BOARD_ID, ["maria", DEMO_USER_ID, "lucas", "pedro", "ana", "rafa"]),
  ...membersFor(BUILD_BOARD_ID, ["pedro", DEMO_USER_ID]),
  ...membersFor(RANDOM_BOARD_ID, [DEMO_USER_ID, "lucas"]),
];

export const demoFrames: Frame[] = [
  { id: "frame-good", boardId: DEMO_BOARD_ID, name: "Good ideas", color: "#34d399", x: 60, y: 60, width: 620, height: 420 },
  { id: "frame-crazy", boardId: DEMO_BOARD_ID, name: "Crazy ideas", color: "#f472b6", x: 740, y: 60, width: 560, height: 420 },
  { id: "frame-research", boardId: DEMO_BOARD_ID, name: "Need research", color: "#60a5fa", x: 60, y: 540, width: 620, height: 340 },
];

interface RawNote {
  id: string;
  boardId: string;
  authorId: string;
  frameId: string | null;
  text: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const demoNotes: RawNote[] = [
  { id: "n1", boardId: DEMO_BOARD_ID, authorId: "lucas", frameId: "frame-good", text: "Aluguel de casa na praia pra galera toda no fim do mês", color: "#fde68a", x: 100, y: 120, width: 220, height: 190, rotation: -2, zIndex: 1, createdAt: minutesAgo(180), updatedAt: minutesAgo(180) },
  { id: "n2", boardId: DEMO_BOARD_ID, authorId: DEMO_USER_ID, frameId: "frame-good", text: "Torneio de Mario Kart com eliminação e prêmio bobo pro último", color: "#b8dcf5", x: 350, y: 180, width: 220, height: 190, rotation: 1, zIndex: 2, createdAt: minutesAgo(150), updatedAt: minutesAgo(150) },
  { id: "n3", boardId: DEMO_BOARD_ID, authorId: "maria", frameId: "frame-crazy", text: "Montar uma banda mesmo sem saber tocar nada", color: "#f7b8c4", x: 780, y: 110, width: 220, height: 190, rotation: 2, zIndex: 3, createdAt: minutesAgo(140), updatedAt: minutesAgo(60) },
  { id: "n4", boardId: DEMO_BOARD_ID, authorId: "pedro", frameId: "frame-crazy", text: "App que só serve pra decidir onde comer quando ninguém decide", color: "#d9c8f5", x: 1020, y: 220, width: 220, height: 190, rotation: -3, zIndex: 4, createdAt: minutesAgo(120), updatedAt: minutesAgo(120) },
  { id: "n5", boardId: DEMO_BOARD_ID, authorId: "ana", frameId: "frame-research", text: "Ver preço de trilha + camping pra outubro", color: "#c9dba6", x: 100, y: 600, width: 220, height: 190, rotation: 1, zIndex: 5, createdAt: minutesAgo(100), updatedAt: minutesAgo(100) },
  { id: "n6", boardId: DEMO_BOARD_ID, authorId: "lucas", frameId: "frame-research", text: "Quanto custa alugar uma churrasqueira boa por um dia?", color: "#fbcaa8", x: 350, y: 660, width: 220, height: 190, rotation: -1, zIndex: 6, createdAt: minutesAgo(90), updatedAt: minutesAgo(90) },
  { id: "n7", boardId: DEMO_BOARD_ID, authorId: DEMO_USER_ID, frameId: null, text: "Maratona de filme ruim de propósito, com votação ao vivo", color: "#e8ddc6", x: 1300, y: 500, width: 220, height: 190, rotation: 2, zIndex: 7, createdAt: minutesAgo(70), updatedAt: minutesAgo(70) },
  { id: "n8", boardId: DEMO_BOARD_ID, authorId: "maria", frameId: "frame-crazy", text: "Fazer um podcast só sobre as brigas bobas do grupo", color: "#f7b8c4", x: 780, y: 320, width: 220, height: 190, rotation: 0, zIndex: 8, createdAt: minutesAgo(50), updatedAt: minutesAgo(20) },
  { id: "n9", boardId: DEMO_BOARD_ID, authorId: "pedro", frameId: "frame-good", text: "Dia de jogos de tabuleiro com pizza no fim de semana", color: "#fde68a", x: 100, y: 340, width: 220, height: 190, rotation: -1, zIndex: 9, createdAt: minutesAgo(30), updatedAt: minutesAgo(30) },
  { id: "n10", boardId: DEMO_BOARD_ID, authorId: "ana", frameId: null, text: "Criar um grupo de corrida de domingo cedo (café depois é obrigatório)", color: "#b7e8d3", x: 1300, y: 250, width: 220, height: 190, rotation: 1, zIndex: 10, createdAt: minutesAgo(10), updatedAt: minutesAgo(4) },
];

export const demoVotes: Array<{ noteId: string; userId: string; value: 1 | -1 }> = [
  { noteId: "n1", userId: DEMO_USER_ID, value: 1 },
  { noteId: "n1", userId: "pedro", value: 1 },
  { noteId: "n1", userId: "maria", value: 1 },
  { noteId: "n2", userId: "lucas", value: 1 },
  { noteId: "n2", userId: "maria", value: 1 },
  { noteId: "n3", userId: DEMO_USER_ID, value: 1 },
  { noteId: "n3", userId: "pedro", value: -1 },
  { noteId: "n4", userId: "lucas", value: 1 },
  { noteId: "n9", userId: DEMO_USER_ID, value: 1 },
  { noteId: "n9", userId: "ana", value: 1 },
  { noteId: "n9", userId: "lucas", value: 1 },
  { noteId: "n10", userId: "lucas", value: 1 },
];

export const demoStars: Array<{ noteId: string; userId: string }> = [
  { noteId: "n1", userId: DEMO_USER_ID },
  { noteId: "n9", userId: "maria" },
];

export const demoReactions: Array<{ id: string; noteId: string; userId: string; emoji: string }> = [
  { id: nanoid(), noteId: "n1", userId: "pedro", emoji: "🔥" },
  { id: nanoid(), noteId: "n1", userId: "maria", emoji: "🔥" },
  { id: nanoid(), noteId: "n3", userId: DEMO_USER_ID, emoji: "😂" },
  { id: nanoid(), noteId: "n3", userId: "ana", emoji: "😂" },
  { id: nanoid(), noteId: "n3", userId: "pedro", emoji: "😬" },
  { id: nanoid(), noteId: "n8", userId: "lucas", emoji: "😂" },
  { id: nanoid(), noteId: "n9", userId: "ana", emoji: "🎲" },
  { id: nanoid(), noteId: "n10", userId: "maria", emoji: "🏃" },
];

export const demoComments: Comment[] = [
  { id: nanoid(), noteId: "n1", authorId: "pedro", text: "bora fechar antes que os preços subam", createdAt: minutesAgo(160) },
  { id: nanoid(), noteId: "n1", authorId: DEMO_USER_ID, text: "vejo uns 3 lugares e mando aqui", createdAt: minutesAgo(155) },
  { id: nanoid(), noteId: "n3", authorId: "pedro", text: "isso vai ser uma vergonha gloriosa", createdAt: minutesAgo(58) },
  { id: nanoid(), noteId: "n8", authorId: "maria", text: "literalmente só episódio 1 já ia ter 10 temporadas", createdAt: minutesAgo(19) },
];

export const demoConnections: Connection[] = [
  { id: nanoid(), boardId: DEMO_BOARD_ID, fromNoteId: "n1", toNoteId: "n6" },
  { id: nanoid(), boardId: DEMO_BOARD_ID, fromNoteId: "n3", toNoteId: "n8" },
];

export const demoActivity: ActivityItem[] = [
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "ana", type: "note_created", payload: { text: "Criar um grupo de corrida de domingo cedo" }, createdAt: minutesAgo(10) },
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "maria", type: "reaction_added", payload: { emoji: "😂", noteText: "Fazer um podcast..." }, createdAt: minutesAgo(19) },
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "pedro", type: "note_moved", payload: { noteText: "Dia de jogos de tabuleiro..." }, createdAt: minutesAgo(28) },
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "lucas", type: "vote_cast", payload: { noteText: "App que só serve pra decidir onde comer" }, createdAt: minutesAgo(45) },
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "maria", type: "comment_added", payload: { noteText: "Fazer um podcast..." }, createdAt: minutesAgo(19) },
  { id: nanoid(), boardId: DEMO_BOARD_ID, userId: "ana", type: "frame_created", payload: { name: "Need research" }, createdAt: minutesAgo(140) },
];
