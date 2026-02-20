import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notebooks, notes } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and, count } from "drizzle-orm";

const MAX_NAME_LENGTH = 200;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const ALLOWED_NOTEBOOK_FIELDS = new Set(["name", "color", "isDefault"]);

function pickAllowed(obj: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (ALLOWED_NOTEBOOK_FIELDS.has(key)) result[key] = obj[key];
  }
  return result;
}

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

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (body.name.trim().length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }

  const color = body.color && HEX_COLOR_RE.test(body.color) ? body.color : "#4CAF50";

  const [notebook] = await db
    .insert(notebooks)
    .values({
      userId,
      name: body.name.trim(),
      color,
    })
    .returning();

  return NextResponse.json(notebook, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();
  const { id, ...rawUpdates } = body;

  if (!id) {
    return NextResponse.json({ error: "Notebook ID required" }, { status: 400 });
  }

  const updates = pickAllowed(rawUpdates);

  if (updates.name !== undefined) {
    if (typeof updates.name !== "string" || !updates.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (updates.name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    updates.name = updates.name.trim();
  }

  if (updates.color !== undefined) {
    if (typeof updates.color !== "string" || !HEX_COLOR_RE.test(updates.color)) {
      return NextResponse.json({ error: "Invalid color format" }, { status: 400 });
    }
  }

  updates.updatedAt = new Date();

  const [notebook] = await db
    .update(notebooks)
    .set(updates)
    .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
    .returning();

  if (!notebook) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

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

  const [deleted] = await db
    .delete(notebooks)
    .where(and(eq(notebooks.id, id), eq(notebooks.userId, userId)))
    .returning({ id: notebooks.id });

  if (!deleted) {
    return NextResponse.json({ error: "Notebook not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
