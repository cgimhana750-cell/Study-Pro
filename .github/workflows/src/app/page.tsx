"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, StatCard, ProgressBar, Badge, PageHeader } from "@/components/ui";
import { getCountdown, randomQuote, todayStr, formatDate } from "@/lib/utils";
import { useFetch, api } from "@/hooks/useApi";
import { motion } from "framer-motion";

interface Subject { id: number; name: string; icon: string; color: string; completedChapters: number; totalChapters: number; averageScore: number; }
interface StudySession { id: number; date: string; duration: number; completed: boolean; topic: string; timeSlot: string; }
interface Homework { id: number; title: string; dueDate: string; status: string; priority: number; }
interface Todo { id: number; title: string; completed: boolean; priority: number; }
interface MockExam { id: number; subjectId: number; obtainedMarks: number; totalMarks: number; date: string; }
interface Activity { id: number; action: string; detail: string; createdAt: string; }
interface TuitionClass { id: number; teacher: string; day: string; time: string; duration: number; }

export default function DashboardPage() {
  const [countdown, setCountdown] = useState(getCountdown());
  const [quote] = useState(randomQuote());
  const [now, setNow] = useState(new Date());
  const [seeded, setSeeded] = useState(false);

  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const { data: sessions } = useFetch<StudySession[]>(`/api/study-sessions?date=${todayStr()}`);
  const { data: allSessions } = useFetch<StudySession[]>("/api/study-sessions");
  const { data: homeworkList } = useFetch<Homework[]>("/api/homework");
  const { data: todoList } = useFetch<Todo[]>("/api/todos");
  const { data: mockExams } = useFetch<MockExam[]>("/api/mock-exams");
  const { data: activity } = useFetch<Activity[]>("/api/activity");
  const { data: classes } = useFetch<TuitionClass[]>("/api/tuition");

  // Seed default subjects on first load
  useEffect(() => {
    if (!seeded) {
      api("/api/seed", "POST").then(() => setSeeded(true)).catch(() => {});
    }
  }, [seeded]);

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown());
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayHours = (sessions || []).filter(s => s.completed).reduce((a, s) => a + s.duration, 0) / 60;
  const weekSessions = (allSessions || []).filter(s => {
    const d = new Date(s.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo && s.completed;
  });
  const weekHours = weekSessions.reduce((a, s) => a + s.duration, 0) / 60;
  const pendingHW = (homeworkList || []).filter(h => h.status === "pending").length;
  const pendingTodos = (todoList || []).filter(t => !t.completed).length;
  const dueHomework = (homeworkList || []).filter(h => h.status === "pending").slice(0, 5);
  const todayDay = now.toLocaleDateString("en-US", { weekday: "long" });
  const upcomingClasses = (classes || []).filter(c => c.day.toLowerCase() === todayDay.toLowerCase()).slice(0, 3);
  const recentMocks = (mockExams || []).slice(-3).reverse();
  const recentActivity = (activity || []).slice(0, 5);

  const overallProgress = subjects && subjects.length > 0
    ? Math.round(subjects.reduce((a, s) => a + (s.totalChapters > 0 ? (s.completedChapters / s.totalChapters) * 100 : 0), 0) / subjects.length)
    : 0;

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle={`${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} • ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
      />

      {/* Countdown */}
      <Card gold className="mb-6">
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-3">⏳ Countdown to G.C.E. O/L Exam — 8 December 2026</p>
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
            {[
              { val: countdown.days, label: "Days" },
              { val: countdown.hours, label: "Hours" },
              { val: countdown.minutes, label: "Minutes" },
              { val: countdown.seconds, label: "Seconds" },
            ].map((item) => (
              <motion.div
                key={item.label}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="text-center"
              >
                <div className="text-3xl md:text-5xl font-bold text-gold tabular-nums">
                  {String(item.val).padStart(2, "0")}
                </div>
                <div className="text-xs text-text-secondary mt-1">{item.label}</div>
              </motion.div>
            ))}
          </div>
          {countdown.days <= 30 && (
            <p className="text-accent-red text-xs mt-3 font-medium">🔥 Less than a month left! Study hard!</p>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="⏱️" label="Today's Study" value={`${todayHours.toFixed(1)}h`} sub="out of 6h goal" />
        <StatCard icon="📅" label="This Week" value={`${weekHours.toFixed(1)}h`} sub="out of 35h goal" />
        <StatCard icon="📝" label="Pending Homework" value={pendingHW} sub={`${pendingTodos} tasks pending`} color="text-accent-orange" />
        <StatCard icon="📊" label="Overall Progress" value={`${overallProgress}%`} sub="across all subjects" color="text-accent-green" />
      </div>

      {/* Goals Progress */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-4 flex items-center gap-2">🎯 Daily Goals</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Study Hours (6h goal)</span>
              <span className="text-gold">{todayHours.toFixed(1)}h / 6h</span>
            </div>
            <ProgressBar value={todayHours} max={6} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Weekly Hours (35h goal)</span>
              <span className="text-gold">{weekHours.toFixed(1)}h / 35h</span>
            </div>
            <ProgressBar value={weekHours} max={35} color="bg-accent-blue" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Overall Syllabus</span>
              <span className="text-gold">{overallProgress}%</span>
            </div>
            <ProgressBar value={overallProgress} max={100} color="bg-accent-green" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Sessions */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">📚 Today&apos;s Study Sessions</h3>
          {(!sessions || sessions.length === 0) ? (
            <p className="text-text-secondary text-sm py-4 text-center">No sessions planned for today. Go to Study Planner to add some!</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-lighter/50">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.completed ? "bg-accent-green" : "bg-gold"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{s.topic}</p>
                    <p className="text-xs text-text-secondary capitalize">{s.timeSlot} • {s.duration}min</p>
                  </div>
                  <Badge color={s.completed ? "green" : "gold"}>{s.completed ? "Done" : "Pending"}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Upcoming Classes */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">🏫 Today&apos;s Classes</h3>
          {upcomingClasses.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No classes scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {upcomingClasses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-lighter/50">
                  <span className="text-lg">🏫</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{c.teacher}</p>
                    <p className="text-xs text-text-secondary">{c.time} • {c.duration}min</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Homework Due */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">📝 Homework Due</h3>
          {dueHomework.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No pending homework! 🎉</p>
          ) : (
            <div className="space-y-2">
              {dueHomework.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-lighter/50">
                  <span className={`text-xs font-bold ${h.priority >= 4 ? "text-accent-red" : "text-gold"}`}>P{h.priority}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{h.title}</p>
                    <p className="text-xs text-text-secondary">Due: {h.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Mock Exams */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">📊 Recent Mock Exams</h3>
          {recentMocks.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No mock exams yet. Start practicing!</p>
          ) : (
            <div className="space-y-2">
              {recentMocks.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface-lighter/50">
                  <span className="text-lg">📋</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{m.obtainedMarks}/{m.totalMarks}</p>
                    <p className="text-xs text-text-secondary">{m.date}</p>
                  </div>
                  <span className="text-sm font-bold text-gold">{Math.round((m.obtainedMarks / m.totalMarks) * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Progress */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">📚 Subject Progress</h3>
          {(!subjects || subjects.length === 0) ? (
            <p className="text-text-secondary text-sm py-4 text-center">Loading subjects...</p>
          ) : (
            <div className="space-y-3">
              {subjects.filter(s => !("archived" in s && (s as Record<string, unknown>).archived)).map((s) => {
                const pct = s.totalChapters > 0 ? Math.round((s.completedChapters / s.totalChapters) * 100) : 0;
                return (
                  <div key={s.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{s.icon} {s.name}</span>
                      <span className="text-text-secondary">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} color={`bg-[${s.color}]`} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">🕐 Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-text-secondary text-sm py-4 text-center">No recent activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg bg-surface-lighter/50">
                  <span className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-text-secondary">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Motivational Quote */}
      <Card gold className="text-center">
        <p className="text-text-secondary text-xs mb-2">💡 Quote of the Day</p>
        <p className="text-lg italic text-gold-light">&ldquo;{quote}&rdquo;</p>
      </Card>
    </AppShell>
  );
}
