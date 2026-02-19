import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scratchPad } from "@/lib/schema";
import { getCurrentUserId, unauthorized } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const [pad] = await db
    .select()
    .from(scratchPad)
    .where(eq(scratchPad.userId, userId));

  return NextResponse.json(pad || { content: "" });
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  const [existing] = await db
    .select()
    .from(scratchPad)
    .where(eq(scratchPad.userId, userId));

  let pad;
  if (existing) {
    [pad] = await db
      .update(scratchPad)
      .set({ content: body.content, updatedAt: new Date() })
      .where(eq(scratchPad.userId, userId))
      .returning();
  } else {
    [pad] = await db
      .insert(scratchPad)
      .values({ userId, content: body.content })
      .returning();
  }

  return NextResponse.json(pad);
}
