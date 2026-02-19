import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, desc } from "drizzle-orm";

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

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: body.title,
      noteId: body.noteId || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })
    .returning();

  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id, ...updates } = body;

  updates.updatedAt = new Date();

  const [task] = await db
    .update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  await db
    .delete(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

  return NextResponse.json({ success: true });
}
