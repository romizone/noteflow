import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, or, ilike, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json([]);
  }

  const results = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        eq(notes.isTrashed, false),
        or(
          ilike(notes.title, `%${q}%`),
          ilike(notes.plainText, `%${q}%`)
        )
      )
    )
    .orderBy(desc(notes.updatedAt))
    .limit(20);

  return NextResponse.json(results);
}
