import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { calendarEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(calendarEvents).orderBy(calendarEvents.date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(calendarEvents).values({
    title: body.title,
    date: body.date,
    time: body.time || "",
    type: body.type || "general",
    subjectId: body.subjectId || null,
    description: body.description || "",
    color: body.color || "#D4AF37",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  return NextResponse.json({ ok: true });
}
