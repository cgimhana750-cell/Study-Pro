import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(50);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(activityLog).values({
    action: body.action,
    detail: body.detail || "",
    category: body.category || "general",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
