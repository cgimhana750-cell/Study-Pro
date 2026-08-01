"use client";

import { useMemo } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, PageHeader, StatCard, ProgressBar } from "@/components/ui";
import { useFetch } from "@/hooks/useApi";
import { todayStr } from "@/lib/utils";

interface Subject { id: number; name: string; icon: string; color: string; totalChapters: number; completedChapters: number; averageScore: number; revisionCount: number; }
interface StudySession { id: number; date: string; duration: number; completed: boolean; subjectId: number | null; }
interface MockExam { id: number; subjectId: number; obtainedMarks: number; totalMarks: number; date: string; }
interface PomodoroSession { id: number; date: string; duration: number; completed: boolean; }
interface Revision { id: number; date: string; subjectId: number; }
interface TuitionClass { id: number; attendedClasses: number; totalClasses: number; }

export default function StatsPage() {
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const { data: sessions } = useFetch<StudySession[]>("/api/study-sessions");
  const { data: mockExams } = useFetch<MockExam[]>("/api/mock-exams");
  const { data: pomodoros } = useFetch<PomodoroSession[]>("/api/pomodoro");
  const { data: revisions } = useFetch<Revision[]>("/api/revisions");
  const { data: classes } = useFetch<TuitionClass[]>("/api/tuition");

  const stats = useMemo(() => {
    const completedSessions = (sessions || []).filter(s => s.completed);
    const totalStudyMin = completedSessions.reduce((a, s) => a + s.duration, 0);
    const totalPomodoroMin = (pomodoros || []).filter(p => p.completed).reduce((a, p) => a + p.duration, 0);
    const avgMockScore = mockExams && mockExams.length > 0
      ? Math.round(mockExams.reduce((a, e) => a + (e.obtainedMarks / e.totalMarks) * 100, 0) / mockExams.length) : 0;
    const totalAttendance = (classes || []).reduce((a, c) => a + c.attendedClasses, 0);
    const totalClassCount = (classes || []).reduce((a, c) => a + c.totalClasses, 0);
    const attendanceRate = totalClassCount > 0 ? Math.round((totalAttendance / totalClassCount) * 100) : 0;

    // Study heatmap - last 30 days
    const heatmap: { date: string; mins: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const mins = completedSessions.filter(s => s.date === ds).reduce((a, s) => a + s.duration, 0);
      heatmap.push({ date: ds, mins });
    }

    // Per-subject study time
    const subjectTime: { name: string; icon: string; color: string; mins: number }[] = [];
    (subjects || []).forEach(sub => {
      const mins = completedSessions.filter(s => s.subjectId === sub.id).reduce((a, s) => a + s.duration, 0);
      subjectTime.push({ name: sub.name, icon: sub.icon, color: sub.color, mins });
    });
    subjectTime.sort((a, b) => b.mins - a.mins);

    return { totalStudyMin, totalPomodoroMin, avgMockScore, attendanceRate, heatmap, subjectTime, totalAttendance, totalClassCount };
  }, [subjects, sessions, mockExams, pomodoros, revisions, classes]);

  const maxHeatmapMins = Math.max(1, ...stats.heatmap.map(h => h.mins));

  return (
    <AppShell>
      <PageHeader title="Statistics & Reports" subtitle="Your comprehensive study analytics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="⏱️" label="Total Study Time" value={`${Math.round(stats.totalStudyMin / 60)}h`} sub={`${stats.totalStudyMin} minutes`} />
        <StatCard icon="🍅" label="Pomodoro Time" value={`${Math.round(stats.totalPomodoroMin / 60)}h`} sub={`${stats.totalPomodoroMin} minutes`} />
        <StatCard icon="📊" label="Avg Mock Score" value={`${stats.avgMockScore}%`} color={stats.avgMockScore >= 75 ? "text-accent-green" : "text-gold"} />
        <StatCard icon="🏫" label="Attendance Rate" value={`${stats.attendanceRate}%`} sub={`${stats.totalAttendance}/${stats.totalClassCount} classes`} />
      </div>

      {/* Study Heatmap */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-3">📊 Study Heatmap (Last 30 Days)</h3>
        <div className="flex gap-1 flex-wrap">
          {stats.heatmap.map(d => (
            <div key={d.date} title={`${d.date}: ${d.mins}min`}
              className="w-6 h-6 rounded-sm transition-colors cursor-pointer"
              style={{
                backgroundColor: d.mins === 0
                  ? "rgba(212,175,55,0.05)"
                  : `rgba(212,175,55,${0.15 + 0.65 * (d.mins / maxHeatmapMins)})`,
              }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
          <span>Less</span>
          {[0.05, 0.2, 0.4, 0.7].map((o, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(212,175,55,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </Card>

      {/* Subject Comparison */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-3">📚 Study Time by Subject</h3>
        {stats.subjectTime.length === 0 ? (
          <p className="text-text-secondary text-sm text-center py-4">No study data yet</p>
        ) : (
          <div className="space-y-3">
            {stats.subjectTime.map(s => {
              const hours = Math.round(s.mins / 60 * 10) / 10;
              const maxMins = Math.max(1, ...stats.subjectTime.map(x => x.mins));
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.icon} {s.name}</span>
                    <span className="text-text-secondary">{hours}h</span>
                  </div>
                  <div className="h-3 bg-surface-lighter rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(s.mins / maxMins) * 100}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Subject Progress */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-3">📈 Subject Completion</h3>
        <div className="space-y-3">
          {(subjects || []).map(s => {
            const pct = s.totalChapters > 0 ? Math.round((s.completedChapters / s.totalChapters) * 100) : 0;
            return (
              <div key={s.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.icon} {s.name}</span>
                  <span className="text-text-secondary">{pct}% ({s.completedChapters}/{s.totalChapters})</span>
                </div>
                <ProgressBar value={pct} max={100} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mock Exam Trends */}
      <Card>
        <h3 className="text-gold font-semibold mb-3">📊 Mock Exam Scores by Subject</h3>
        <div className="space-y-3">
          {(subjects || []).map(sub => {
            const subExams = (mockExams || []).filter(e => e.subjectId === sub.id);
            if (subExams.length === 0) return null;
            const avg = Math.round(subExams.reduce((a, e) => a + (e.obtainedMarks / e.totalMarks) * 100, 0) / subExams.length);
            return (
              <div key={sub.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{sub.icon} {sub.name} ({subExams.length} exams)</span>
                  <span className={avg >= 75 ? "text-accent-green" : avg >= 50 ? "text-gold" : "text-accent-red"}>{avg}%</span>
                </div>
                <ProgressBar value={avg} max={100} color={avg >= 75 ? "bg-accent-green" : avg >= 50 ? "bg-gold" : "bg-accent-red"} />
              </div>
            );
          }).filter(Boolean)}
          {(mockExams || []).length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">No mock exam data yet</p>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
