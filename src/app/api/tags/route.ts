import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tags, noteTags } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, count } from "drizzle-orm";

const MAX_NAME_LENGTH = 100;

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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (body.name.trim().length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }

  const [tag] = await db
    .insert(tags)
    .values({ userId, name: body.name.trim() })
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

  const [deleted] = await db
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning({ id: tags.id });

  if (!deleted) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
