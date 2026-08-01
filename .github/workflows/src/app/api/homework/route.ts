import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { homework } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(homework).orderBy(homework.dueDate);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(homework).values({
    subjectId: body.subjectId || null,
    title: body.title,
    description: body.description || "",
    dueDate: body.dueDate,
    priority: body.priority || 3,
    status: body.status || "pending",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(homework).set({ ...data, updatedAt: new Date() }).where(eq(homework.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(homework).where(eq(homework.id, id));
  return NextResponse.json({ ok: true });
}
