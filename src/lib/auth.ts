import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dsc_admin";
export const AGE_COOKIE = "dsc_door";

function token() {
  return Buffer.from(`admin:${process.env.ADMIN_PASSWORD || "changeme"}`).toString("base64");
}

export async function isAdmin() {
  return (await cookies()).get(ADMIN_COOKIE)?.value === token();
}

export function adminToken() {
  return token();
}

export function checkPassword(input: string) {
  return input === (process.env.ADMIN_PASSWORD || "changeme");
}
