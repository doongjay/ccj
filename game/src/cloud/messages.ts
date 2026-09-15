import { z } from "zod";
import { OUTFIT_LABELS } from "../data/guestOutfits";
import { CloudSaveError, guestConnection, publicConnection } from "./client";

const avatarSchema = z.object({
  gender: z.enum(["male", "female"]).optional(),
  outfit: z.number().int().min(0).max(OUTFIT_LABELS.male.length - 1).optional(),
  hair: z.number().int().min(0).max(2).optional(),
  face: z.number().int().min(0).max(2).optional(),
});
const inputSchema = z.object({
  name: z.string().trim().min(1).max(20), side: z.enum(["groom", "bride"]),
  message: z.string().trim().min(1).max(1000), avatar: avatarSchema,
});
const recordSchema = inputSchema.extend({
  id: z.uuid(), created_at: z.iso.datetime({ offset: true }), avatar: avatarSchema.catch({}),
});
type MessageInput = z.input<typeof inputSchema>;
const pending = new Map<string, string>();

function messageFromRow(value: unknown) {
  const row = recordSchema.parse(value);
  return { id: row.id, name: row.name, side: row.side, message: row.message,
    recipient: row.side === "bride" ? "현서" : "재준", createdAt: row.created_at, ...row.avatar };
}
export async function loadCloudMessages() {
  const client = publicConnection();
  const messages: ReturnType<typeof messageFromRow>[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from("guestbook_entries").select("id,name,side,message,avatar,created_at")
      .order("created_at").order("id").range(offset, offset + pageSize - 1);
    if (error) throw new CloudSaveError();
    const rows = z.array(recordSchema).parse(data);
    messages.push(...rows.map(messageFromRow));
    if (rows.length < pageSize) return messages;
  }
}
export async function sendCloudMessage(input: MessageInput) {
  const parsed = inputSchema.parse(input);
  const fingerprint = JSON.stringify(parsed);
  const id = pending.get(fingerprint) ?? crypto.randomUUID();
  pending.set(fingerprint, id);
  const { client, userId } = await guestConnection();
  const { data, error } = await client.from("guest_messages").insert({ ...parsed, id, user_id: userId }).select().single();
  if (error) {
    // A lost response may hide a committed insert; confirm the same ID before retrying.
    if (error.code !== "23505") throw new CloudSaveError();
    const existing = await client.from("guest_messages").select("*").eq("id", id).single();
    if (existing.error) throw new CloudSaveError();
    const result = messageFromRow(existing.data);
    pending.delete(fingerprint);
    return result;
  }
  const result = messageFromRow(data);
  pending.delete(fingerprint);
  return result;
}
