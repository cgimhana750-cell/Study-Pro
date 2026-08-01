import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(subjects).orderBy(subjects.priority);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(subjects).values({
    name: body.name,
    color: body.color || "#D4AF37",
    icon: body.icon || "📘",
    teacher: body.teacher || "",
    priority: body.priority || 3,
    difficulty: body.difficulty || 3,
    totalChapters: body.totalChapters || 0,
    weakTopics: body.weakTopics || "",
    strongTopics: body.strongTopics || "",
    notes: body.notes || "",
    resources: body.resources || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(subjects).set({ ...data, updatedAt: new Date() }).where(eq(subjects.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(subjects).where(eq(subjects.id, id));
  return NextResponse.json({ ok: true });
}
