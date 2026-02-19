import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, noteTags, tags } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, desc, isNull } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const notebookId = req.nextUrl.searchParams.get("notebookId");
  const tagId = req.nextUrl.searchParams.get("tagId");
  const trashed = req.nextUrl.searchParams.get("trashed") === "true";

  let conditions = [eq(notes.userId, userId)];

  if (trashed) {
    conditions.push(eq(notes.isTrashed, true));
  } else {
    conditions.push(eq(notes.isTrashed, false));
  }

  if (notebookId) {
    conditions.push(eq(notes.notebookId, notebookId));
  }

  let results;

  if (tagId) {
    results = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        plainText: notes.plainText,
        notebookId: notes.notebookId,
        isPinned: notes.isPinned,
        isFavorite: notes.isFavorite,
        isTrashed: notes.isTrashed,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .innerJoin(noteTags, eq(notes.id, noteTags.noteId))
      .where(and(...conditions, eq(noteTags.tagId, tagId)))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));
  } else {
    results = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  const [note] = await db
    .insert(notes)
    .values({
      userId,
      title: body.title || "Untitled",
      content: body.content || "",
      plainText: body.plainText || "",
      notebookId: body.notebookId || null,
    })
    .returning();

  if (body.tagIds?.length) {
    await db.insert(noteTags).values(
      body.tagIds.map((tagId: string) => ({
        noteId: note.id,
        tagId,
      }))
    );
  }

  return NextResponse.json(note, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id, tagIds, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Note ID required" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  const [note] = await db
    .update(notes)
    .set(updates)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  if (tagIds !== undefined) {
    await db.delete(noteTags).where(eq(noteTags.noteId, id));
    if (tagIds.length) {
      await db.insert(noteTags).values(
        tagIds.map((tagId: string) => ({ noteId: id, tagId }))
      );
    }
  }

  return NextResponse.json(note);
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Note ID required" }, { status: 400 });
  }

  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));

  return NextResponse.json({ success: true });
}
