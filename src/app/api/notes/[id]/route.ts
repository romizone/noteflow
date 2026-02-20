import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, noteTags } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const { id } = await params;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  // Also fetch associated tag IDs
  const tagRows = await db
    .select({ tagId: noteTags.tagId })
    .from(noteTags)
    .where(eq(noteTags.noteId, id));

  return NextResponse.json({
    ...note,
    tagIds: tagRows.map((r) => r.tagId),
  });
}
