import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { revisions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(revisions).orderBy(revisions.date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(revisions).values({
    subjectId: body.subjectId,
    chapterId: body.chapterId || null,
    date: body.date,
    type: body.type || "daily",
    quality: body.quality || 3,
    notes: body.notes || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(revisions).where(eq(revisions.id, id));
  return NextResponse.json({ ok: true });
}
