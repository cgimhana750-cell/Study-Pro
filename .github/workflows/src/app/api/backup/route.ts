import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";

export async function GET() {
  // Export all data as JSON
  const data = {
    subjects: await db.select().from(schema.subjects),
    chapters: await db.select().from(schema.chapters),
    tuitionClasses: await db.select().from(schema.tuitionClasses),
    studySessions: await db.select().from(schema.studySessions),
    pomodoroSessions: await db.select().from(schema.pomodoroSessions),
    homework: await db.select().from(schema.homework),
    revisions: await db.select().from(schema.revisions),
    mockExams: await db.select().from(schema.mockExams),
    notes: await db.select().from(schema.notes),
    todos: await db.select().from(schema.todos),
    calendarEvents: await db.select().from(schema.calendarEvents),
    activityLog: await db.select().from(schema.activityLog),
    exportedAt: new Date().toISOString(),
  };
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // Import data from JSON backup
  const data = await req.json();
  try {
    if (data.subjects?.length) {
      for (const s of data.subjects) {
        const { id, ...rest } = s;
        await db.insert(schema.subjects).values({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
      }
    }
    if (data.chapters?.length) {
      for (const c of data.chapters) {
        const { id, ...rest } = c;
        await db.insert(schema.chapters).values({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
      }
    }
    if (data.todos?.length) {
      for (const t of data.todos) {
        const { id, ...rest } = t;
        await db.insert(schema.todos).values({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
      }
    }
    if (data.homework?.length) {
      for (const h of data.homework) {
        const { id, ...rest } = h;
        await db.insert(schema.homework).values({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
      }
    }
    if (data.notes?.length) {
      for (const n of data.notes) {
        const { id, ...rest } = n;
        await db.insert(schema.notes).values({ ...rest, createdAt: new Date(rest.createdAt), updatedAt: new Date(rest.updatedAt) });
      }
    }
    return NextResponse.json({ ok: true, message: "Backup restored successfully" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
