import { cloudEnabled } from "../cloud/client";
import { loadCloudMessages, sendCloudMessage } from "../cloud/messages";
import type { GuestSide } from "./gameState";

export const GUEST_MESSAGES_KEY = "wedding.guestMessages";

export type GuestMessage = Readonly<{
  id: string;
  name: string;
  side: GuestSide;
  recipient: string;
  message: string;
  createdAt: string;
  gender?: "male" | "female";
  outfit?: number;
  hair?: number;
  face?: number;
}>;

let cloudMessages: GuestMessage[] = [];

export async function refreshGuestMessages(): Promise<void> {
  if (!cloudEnabled) return;
  const before = new Set(cloudMessages.map(message => message.id));
  const loaded = await loadCloudMessages();
  const savedDuringLoad = cloudMessages.filter(message => !before.has(message.id));
  cloudMessages = [...new Map([...loaded, ...savedDuringLoad].map(message => [message.id, message])).values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function readGuestMessages(): GuestMessage[] {
  if (cloudEnabled) return [...cloudMessages];
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(GUEST_MESSAGES_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry): entry is GuestMessage => typeof entry === "object" && entry !== null
      && typeof entry.id === "string" && typeof entry.name === "string" && typeof entry.message === "string"
      && typeof entry.createdAt === "string" && (entry.side === "groom" || entry.side === "bride"));
  } catch { return []; }
}

export async function saveGuestMessage(name: string, side: GuestSide, message: string, avatar?: { gender: "male" | "female"; outfit: number; hair: number; face?: number }): Promise<void> {
  if (cloudEnabled) {
    const entry = await sendCloudMessage({ name, side, message, avatar: avatar ?? {} });
    cloudMessages = [...cloudMessages.filter(saved => saved.id !== entry.id), entry];
    return;
  }
  if (!name.trim() || !message.trim()) throw new Error("Name and message are required.");
  const saved = localStorage.getItem(GUEST_MESSAGES_KEY);
  const entries: unknown = saved === null ? [] : JSON.parse(saved);
  if (!Array.isArray(entries)) throw new Error("Invalid local message storage.");
  localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify([...entries, {
    id: crypto.randomUUID(),
    name: name.trim(),
    side,
    recipient: side === "bride" ? "현서" : "재준",
    message: message.trim(),
    createdAt: new Date().toISOString(),
    ...(avatar ?? {}),
  }]));
}
