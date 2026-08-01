import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pomodoroSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const rows = date
    ? await db.select().from(pomodoroSessions).where(eq(pomodoroSessions.date, date))
    : await db.select().from(pomodoroSessions);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(pomodoroSessions).values({
    subjectId: body.subjectId || null,
    date: body.date,
    duration: body.duration || 25,
    completed: body.completed ?? true,
    focusType: body.focusType || "study",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(pomodoroSessions).where(eq(pomodoroSessions.id, id));
  return NextResponse.json({ ok: true });
}
