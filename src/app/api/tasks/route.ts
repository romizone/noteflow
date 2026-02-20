import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, notes } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, desc } from "drizzle-orm";

const MAX_TITLE_LENGTH = 500;

const ALLOWED_TASK_FIELDS = new Set([
  "title",
  "isCompleted",
  "noteId",
  "dueDate",
]);

function pickAllowed(obj: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (ALLOWED_TASK_FIELDS.has(key)) result[key] = obj[key];
  }
  return result;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(tasks.isCompleted, desc(tasks.createdAt));

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (body.title.trim().length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: "Title is too long" }, { status: 400 });
  }

  // Validate noteId ownership
  if (body.noteId) {
    const [note] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, body.noteId), eq(notes.userId, userId)));
    if (!note) {
      return NextResponse.json({ error: "Invalid note" }, { status: 400 });
    }
  }

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: body.title.trim(),
      noteId: body.noteId || null,
      dueDate: body.dueDate ? (() => {
        const d = new Date(body.dueDate);
        return isNaN(d.getTime()) ? null : d;
      })() : null,
    })
    .returning();

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id, ...rawUpdates } = body;

  if (!id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  const updates = pickAllowed(rawUpdates);

  if (updates.title !== undefined) {
    if (typeof updates.title !== "string" || !updates.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (updates.title.trim().length > MAX_TITLE_LENGTH) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }
    updates.title = updates.title.trim();
  }

  // Validate noteId ownership if being changed (allow null to unlink)
  if (updates.noteId !== undefined && updates.noteId !== null) {
    const [note] = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.id, updates.noteId as string), eq(notes.userId, userId)));
    if (!note) {
      return NextResponse.json({ error: "Invalid note" }, { status: 400 });
    }
  }

  if (updates.dueDate !== undefined) {
    if (updates.dueDate) {
      const parsed = new Date(updates.dueDate as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      updates.dueDate = parsed;
    } else {
      updates.dueDate = null;
    }
  }

  (updates as Record<string, unknown>).updatedAt = new Date();

  const [task] = await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning({ id: tasks.id });

  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
