import { cookies } from "next/headers";
import { query } from "./pool";
import {
  cookieOptions,
  persistenceConfigured,
  signUserId,
  USER_COOKIE_NAME,
  verifySignedUserId,
} from "./user-cookie";

export async function ensureUserId(): Promise<string | null> {
  if (!persistenceConfigured()) return null;
  const store = await cookies();
  let id = await verifySignedUserId(store.get(USER_COOKIE_NAME)?.value);
  if (!id) {
    id = crypto.randomUUID();
    try {
      store.set(USER_COOKIE_NAME, await signUserId(id), cookieOptions());
    } catch {
      return null;
    }
  }
  await query(
    `INSERT INTO users (id) VALUES ($1)
     ON CONFLICT (id) DO UPDATE SET last_seen_at = NOW()`,
    [id]
  );
  return id;
}

export async function readUserIdFromRequestCookie(cookieHeader: string | null): Promise<string | null> {
  if (!persistenceConfigured() || !cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${USER_COOKIE_NAME}=`)) continue;
    const value = decodeURIComponent(trimmed.slice(USER_COOKIE_NAME.length + 1));
    return verifySignedUserId(value);
  }
  return null;
}
