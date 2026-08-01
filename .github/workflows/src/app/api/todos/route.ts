import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(todos).orderBy(todos.priority);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(todos).values({
    title: body.title,
    description: body.description || "",
    priority: body.priority || 3,
    dueDate: body.dueDate || "",
    recurring: body.recurring || "none",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [row] = await db.update(todos).set({ ...data, updatedAt: new Date() }).where(eq(todos.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await db.delete(todos).where(eq(todos.id, id));
  return NextResponse.json({ ok: true });
}
