import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const pattern = `%${q}%`;

  const [subs, chaps, hw, nts, tds, cls] = await Promise.all([
    db.select().from(schema.subjects).where(
      or(ilike(schema.subjects.name, pattern), ilike(schema.subjects.teacher, pattern))
    ),
    db.select().from(schema.chapters).where(
      or(ilike(schema.chapters.name, pattern), ilike(schema.chapters.notes, pattern))
    ),
    db.select().from(schema.homework).where(
      or(ilike(schema.homework.title, pattern), ilike(schema.homework.description, pattern))
    ),
    db.select().from(schema.notes).where(
      or(ilike(schema.notes.title, pattern), ilike(schema.notes.content, pattern), ilike(schema.notes.tags, pattern))
    ),
    db.select().from(schema.todos).where(
      or(ilike(schema.todos.title, pattern), ilike(schema.todos.description, pattern))
    ),
    db.select().from(schema.tuitionClasses).where(
      or(ilike(schema.tuitionClasses.teacher, pattern), ilike(schema.tuitionClasses.institute, pattern))
    ),
  ]);

  const results = [
    ...subs.map(s => ({ type: "subject" as const, id: s.id, title: s.name, sub: s.teacher || "" })),
    ...chaps.map(c => ({ type: "chapter" as const, id: c.id, title: c.name, sub: `Subject #${c.subjectId}` })),
    ...hw.map(h => ({ type: "homework" as const, id: h.id, title: h.title, sub: h.dueDate })),
    ...nts.map(n => ({ type: "note" as const, id: n.id, title: n.title, sub: n.tags || "" })),
    ...tds.map(t => ({ type: "todo" as const, id: t.id, title: t.title, sub: t.dueDate || "" })),
    ...cls.map(c => ({ type: "class" as const, id: c.id, title: c.teacher, sub: c.institute || "" })),
  ];

  return NextResponse.json({ results });
}
