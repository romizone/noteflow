import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notebooks, notes } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const results = await db
    .select({
      id: notebooks.id,
      name: notebooks.name,
      color: notebooks.color,
      isDefault: notebooks.isDefault,
      createdAt: notebooks.createdAt,
      updatedAt: notebooks.updatedAt,
      noteCount: count(notes.id),
    })
    .from(notebooks)
    .leftJoin(
      notes,
      and(eq(notebooks.id, notes.notebookId), eq(notes.isTrashed, false))
    )
    .where(eq(notebooks.userId, userId))
    .groupBy(notebooks.id)
    .orderBy(notebooks.name);

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  const [notebook] = await db
    .insert(notebooks)
    .values({
      userId,
      name: body.name,
      color: body.color || "#4CAF50",
    })
    .returning();

  return NextResponse.json(notebook, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id, ...updates } = body;

  updates.updatedAt = new Date();

  const [notebook] = await db
    .update(notebooks)
    .set(updates)
    .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
    .returning();

  return NextResponse.json(notebook);
}

export async function DELETE(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Notebook ID required" },
      { status: 400 }
    );
  }

  await db
    .delete(notebooks)
    .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)));

  return NextResponse.json({ success: true });
}
