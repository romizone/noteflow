import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return (session?.user as { id?: string })?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
