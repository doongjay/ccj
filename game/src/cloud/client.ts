import ky from "ky";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
export const cloudEnabled = Boolean(url && key);
const client = url && key ? createClient(url, key, { global: { fetch: (input, init) => ky(input, {
  ...init, retry: 0, timeout: 15000, throwHttpErrors: false,
}) } }) : undefined;

export class CloudSaveError extends Error {
  constructor(message = "전송하지 못했어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.") {
    super(message);
    this.name = "CloudSaveError";
  }
}

let signingIn: Promise<string> | undefined;
export async function guestConnection() {
  if (!client) throw new CloudSaveError("서버 연결이 설정되지 않았어요.");
  const { data, error } = await client.auth.getSession();
  if (error) throw new CloudSaveError();
  if (data.session) return { client, userId: data.session.user.id };
  if (!signingIn) {
    signingIn = client.auth.signInAnonymously().then(({ data: auth, error: failure }) => {
      if (failure || !auth.user) throw new CloudSaveError();
      return auth.user.id;
    }).finally(() => { signingIn = undefined; });
  }
  return { client, userId: await signingIn };
}
