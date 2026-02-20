import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, noteTags, tags, notebooks } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, desc, inArray } from "drizzle-orm";

const MAX_TITLE_LENGTH = 500;
const MAX_CONTENT_LENGTH = 500_000; // ~500KB

const ALLOWED_NOTE_FIELDS = new Set([
  "title",
  "content",
  "plainText",
  "notebookId",
  "isPinned",
  "isFavorite",
  "isTrashed",
  "trashedAt",
]);

function pickAllowed(obj: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (ALLOWED_NOTE_FIELDS.has(key)) result[key] = obj[key];
  }
  return result;
}

async function validateNotebookOwnership(notebookId: string, userId: string) {
  const [nb] = await db
    .select({ id: notebooks.id })
    .from(notebooks)
    .where(and(eq(notebooks.id, notebookId), eq(notebooks.userId, userId)));
  return !!nb;
}

async function validateTagOwnership(tagIds: string[], userId: string) {
  if (!tagIds.length) return true;
  const owned = await db
    .select({ id: tags.id })
    .from(tags)
    .where(and(eq(tags.userId, userId), inArray(tags.id, tagIds)));
  return owned.length === tagIds.length;
}

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
    if (!(await validateNotebookOwnership(notebookId, userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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

  // Input validation
  if (body.title && typeof body.title !== "string") {
    return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
  }
  if (body.title && body.title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }
  if (body.content && typeof body.content !== "string") {
    return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
  }
  if (body.content && body.content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Content is too long" }, { status: 400 });
  }

  // Validate notebookId ownership
  if (body.notebookId) {
    if (!(await validateNotebookOwnership(body.notebookId, userId))) {
      return NextResponse.json({ error: "Invalid notebook" }, { status: 400 });
    }
  }

  // Validate tagIds ownership
  if (body.tagIds?.length) {
    if (!(await validateTagOwnership(body.tagIds, userId))) {
      return NextResponse.json({ error: "Invalid tag IDs" }, { status: 400 });
    }
  }

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
  const { id, tagIds, ...rawUpdates } = body;

  if (!id) {
    return NextResponse.json({ error: "Note ID required" }, { status: 400 });
  }

  // Allow-list: only permit known safe fields
  const updates = pickAllowed(rawUpdates);

  // Validate field types
  if (updates.title !== undefined && typeof updates.title !== "string") {
    return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
  }
  if (updates.title && (updates.title as string).length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }
  if (updates.content !== undefined && typeof updates.content !== "string") {
    return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
  }
  if (updates.content && (updates.content as string).length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "Content is too long" }, { status: 400 });
  }

  // Convert date strings to Date objects for Drizzle
  if (updates.trashedAt && typeof updates.trashedAt === "string") {
    updates.trashedAt = new Date(updates.trashedAt);
  }
  updates.updatedAt = new Date();

  // Validate notebookId ownership if being changed (allow null to remove from notebook)
  if (updates.notebookId !== undefined && updates.notebookId !== null) {
    if (!(await validateNotebookOwnership(updates.notebookId as string, userId))) {
      return NextResponse.json({ error: "Invalid notebook" }, { status: 400 });
    }
  }

  const [note] = await db
    .update(notes)
    .set(updates)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  if (tagIds !== undefined) {
    // Validate tagIds ownership
    if (tagIds.length && !(await validateTagOwnership(tagIds, userId))) {
      return NextResponse.json({ error: "Invalid tag IDs" }, { status: 400 });
    }
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

  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id });

  if (!deleted) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
