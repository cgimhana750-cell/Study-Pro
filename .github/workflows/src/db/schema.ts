import {
  pgTable, text, integer, boolean, timestamp, real, serial, date as pgDate,
} from "drizzle-orm/pg-core";

// ── Subjects ──
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#D4AF37"),
  icon: text("icon").notNull().default("📘"),
  teacher: text("teacher").default(""),
  priority: integer("priority").notNull().default(3),
  difficulty: integer("difficulty").notNull().default(3),
  totalChapters: integer("total_chapters").notNull().default(0),
  completedChapters: integer("completed_chapters").notNull().default(0),
  revisionCount: integer("revision_count").notNull().default(0),
  averageScore: real("average_score").notNull().default(0),
  weakTopics: text("weak_topics").default(""),
  strongTopics: text("strong_topics").default(""),
  notes: text("notes").default(""),
  resources: text("resources").default(""),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Chapters ──
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull().default("not_started"),
  progress: integer("progress").notNull().default(0),
  difficulty: integer("difficulty").notNull().default(3),
  priority: integer("priority").notNull().default(3),
  timeSpent: integer("time_spent").notNull().default(0),
  notes: text("notes").default(""),
  revisionCount: integer("revision_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Tuition Classes ──
export const tuitionClasses = pgTable("tuition_classes", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  teacher: text("teacher").notNull(),
  institute: text("institute").default(""),
  mode: text("mode").notNull().default("physical"),
  day: text("day").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull().default(60),
  monthlyFee: real("monthly_fee").notNull().default(0),
  totalClasses: integer("total_classes").notNull().default(0),
  attendedClasses: integer("attended_classes").notNull().default(0),
  missedClasses: integer("missed_classes").notNull().default(0),
  notes: text("notes").default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Study Sessions (Daily Planner) ──
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull().default("morning"),
  topic: text("topic").notNull(),
  duration: integer("duration").notNull().default(60),
  completed: boolean("completed").notNull().default(false),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Pomodoro Sessions ──
export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  date: text("date").notNull(),
  duration: integer("duration").notNull().default(25),
  completed: boolean("completed").notNull().default(false),
  focusType: text("focus_type").default("study"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Homework ──
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  title: text("title").notNull(),
  description: text("description").default(""),
  dueDate: text("due_date").notNull(),
  priority: integer("priority").notNull().default(3),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Revisions ──
export const revisions = pgTable("revisions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  chapterId: integer("chapter_id"),
  date: text("date").notNull(),
  type: text("type").notNull().default("daily"),
  quality: integer("quality").notNull().default(3),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Mock Exams ──
export const mockExams = pgTable("mock_exams", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  date: text("date").notNull(),
  totalMarks: integer("total_marks").notNull().default(100),
  obtainedMarks: integer("obtained_marks").notNull().default(0),
  grade: text("grade").default(""),
  timeTaken: integer("time_taken").notNull().default(0),
  wrongAnswers: text("wrong_answers").default(""),
  weakTopics: text("weak_topics").default(""),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Notes ──
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id"),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  tags: text("tags").default(""),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── To-Do Items ──
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  priority: integer("priority").notNull().default(3),
  completed: boolean("completed").notNull().default(false),
  dueDate: text("due_date").default(""),
  recurring: text("recurring").default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Calendar Events ──
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").default(""),
  type: text("type").notNull().default("general"),
  subjectId: integer("subject_id"),
  description: text("description").default(""),
  color: text("color").default("#D4AF37"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Activity Log ──
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  detail: text("detail").default(""),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Settings / Backup ──
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
