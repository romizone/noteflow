import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags, noteTags } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const results = await db
    .select({
      id: tags.id,
      name: tags.name,
      createdAt: tags.createdAt,
      noteCount: count(noteTags.noteId),
    })
    .from(tags)
    .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
    .where(eq(tags.userId, userId))
    .groupBy(tags.id)
    .orderBy(tags.name);

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  const [tag] = await db
    .insert(tags)
    .values({ userId, name: body.name })
    .returning();

  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Tag ID required" }, { status: 400 });
  }

  await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));

  return NextResponse.json({ success: true });
}
