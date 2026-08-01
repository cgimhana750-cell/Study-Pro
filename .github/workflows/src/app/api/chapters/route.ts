import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const rows = subjectId
    ? await db.select().from(chapters).where(eq(chapters.subjectId, Number(subjectId))).orderBy(chapters.priority)
    : await db.select().from(chapters).orderBy(chapters.priority);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(chapters).values({
    subjectId: body.subjectId,
    name: body.name,
    status: body.status || "not_started",
    difficulty: body.difficulty || 3,
    priority: body.priority || 3,
    notes: body.notes || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(chapters).set({ ...data, updatedAt: new Date() }).where(eq(chapters.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(chapters).where(eq(chapters.id, id));
  return NextResponse.json({ ok: true });
}
