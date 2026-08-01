import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { mockExams } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(mockExams).orderBy(mockExams.date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(mockExams).values({
    subjectId: body.subjectId,
    date: body.date,
    totalMarks: body.totalMarks || 100,
    obtainedMarks: body.obtainedMarks || 0,
    grade: body.grade || "",
    timeTaken: body.timeTaken || 0,
    wrongAnswers: body.wrongAnswers || "",
    weakTopics: body.weakTopics || "",
    notes: body.notes || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(mockExams).set(data).where(eq(mockExams.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(mockExams).where(eq(mockExams.id, id));
  return NextResponse.json({ ok: true });
}
