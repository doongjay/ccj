import type { GuestSide } from "../state/gameState";
import type { MinimiProfile } from "../ui/minimi";
import { CloudSaveError, guestConnection } from "./client";

export type PhotoSubmission = Readonly<{
  id: string; name: string; side: GuestSide; kind: "booth" | "bridal" | "group";
  avatar: MinimiProfile; canvas: HTMLCanvasElement;
}>;
export async function sendCloudPhoto(photo: PhotoSubmission): Promise<void> {
  const blob = await new Promise<Blob>((resolve, reject) => photo.canvas.toBlob(value => {
    if (value) resolve(value); else reject(new CloudSaveError("사진을 만들지 못했어요. 다시 시도해 주세요."));
  }, "image/png"));
  const { client, userId } = await guestConnection();
  const path = `${userId}/${photo.id}.png`;
  const upload = await client.storage.from("guest-photos").upload(path, blob, { contentType: "image/png", upsert: false });
  if (upload.error) {
    // Retry after a lost upload response without overwriting an existing photo.
    const existing = await client.storage.from("guest-photos").info(path);
    if (existing.error) throw new CloudSaveError();
  }
  const { error } = await client.from("guest_photos").insert({ id: photo.id, user_id: userId,
    name: photo.name, side: photo.side, kind: photo.kind, avatar: photo.avatar, storage_path: path });
  if (error && error.code !== "23505") throw new CloudSaveError();
}
