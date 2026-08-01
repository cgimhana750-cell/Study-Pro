import { NextResponse } from "next/server";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { DEFAULT_SUBJECTS } from "@/lib/utils";

export async function POST() {
  const existing = await db.select().from(subjects);
  if (existing.length > 0) {
    return NextResponse.json({ message: "Already seeded", count: existing.length });
  }
  for (const s of DEFAULT_SUBJECTS) {
    await db.insert(subjects).values({
      name: s.name,
      icon: s.icon,
      color: s.color,
    });
  }
  return NextResponse.json({ message: "Seeded", count: DEFAULT_SUBJECTS.length });
}
