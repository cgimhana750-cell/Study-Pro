import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tuitionClasses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(tuitionClasses).orderBy(tuitionClasses.day);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(tuitionClasses).values({
    subjectId: body.subjectId || null,
    teacher: body.teacher,
    institute: body.institute || "",
    mode: body.mode || "physical",
    day: body.day,
    time: body.time,
    duration: body.duration || 60,
    monthlyFee: body.monthlyFee || 0,
    notes: body.notes || "",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(tuitionClasses).set({ ...data, updatedAt: new Date() }).where(eq(tuitionClasses.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(tuitionClasses).where(eq(tuitionClasses.id, id));
  return NextResponse.json({ ok: true });
}
