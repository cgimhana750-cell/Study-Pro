import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const rows = date
    ? await db.select().from(studySessions).where(eq(studySessions.date, date))
    : await db.select().from(studySessions);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(studySessions).values({
    subjectId: body.subjectId || null,
    date: body.date,
    timeSlot: body.timeSlot || "morning",
    topic: body.topic,
    duration: body.duration || 60,
    completed: body.completed || false,
    notes: body.notes || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(studySessions).set(data).where(eq(studySessions.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(studySessions).where(eq(studySessions.id, id));
  return NextResponse.json({ ok: true });
}
