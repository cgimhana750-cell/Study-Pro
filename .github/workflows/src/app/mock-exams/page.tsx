"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, Badge, EmptyState, StatCard } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr, getGrade, getGradeColor } from "@/lib/utils";

interface MockExam {
  id: number; subjectId: number; date: string; totalMarks: number;
  obtainedMarks: number; grade: string; timeTaken: number;
  wrongAnswers: string; weakTopics: string; notes: string;
}
interface Subject { id: number; name: string; icon: string; }

export default function MockExamsPage() {
  const { data: exams, refetch } = useFetch<MockExam[]>("/api/mock-exams");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<MockExam | null>(null);
  const [form, setForm] = useState({
    subjectId: "", date: todayStr(), totalMarks: 100, obtainedMarks: 0,
    timeTaken: 120, wrongAnswers: "", weakTopics: "", notes: "",
  });

  const openCreate = () => {
    setEditExam(null);
    setForm({ subjectId: "", date: todayStr(), totalMarks: 100, obtainedMarks: 0, timeTaken: 120, wrongAnswers: "", weakTopics: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (e: MockExam) => {
    setEditExam(e);
    setForm({
      subjectId: String(e.subjectId), date: e.date, totalMarks: e.totalMarks,
      obtainedMarks: e.obtainedMarks, timeTaken: e.timeTaken,
      wrongAnswers: e.wrongAnswers || "", weakTopics: e.weakTopics || "", notes: e.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.subjectId) return;
    const grade = getGrade(form.obtainedMarks, form.totalMarks);
    const data = { ...form, subjectId: Number(form.subjectId), grade };
    if (editExam) {
      await api("/api/mock-exams", "PUT", { id: editExam.id, ...data });
    } else {
      await api("/api/mock-exams", "POST", data);
    }
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this exam?")) return;
    await api("/api/mock-exams", "DELETE", { id });
    refetch();
  };

  const avgScore = exams && exams.length > 0
    ? Math.round(exams.reduce((a, e) => a + (e.obtainedMarks / e.totalMarks) * 100, 0) / exams.length)
    : 0;
  const bestScore = exams && exams.length > 0
    ? Math.round(Math.max(...exams.map(e => (e.obtainedMarks / e.totalMarks) * 100)))
    : 0;

  return (
    <AppShell>
      <PageHeader
        title="Mock Exam Tracker"
        subtitle={`${(exams || []).length} exams recorded`}
        action={<Button onClick={openCreate}>+ Add Exam</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📊" label="Average Score" value={`${avgScore}%`} color="text-gold" />
        <StatCard icon="🏆" label="Best Score" value={`${bestScore}%`} color="text-accent-green" />
        <StatCard icon="📝" label="Total Exams" value={(exams || []).length} />
      </div>

      {/* Bar chart substitute */}
      {exams && exams.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-gold font-semibold mb-3">📈 Score Trends</h3>
          <div className="flex items-end gap-1 h-32">
            {exams.slice(-20).map((e, i) => {
              const pct = (e.obtainedMarks / e.totalMarks) * 100;
              const sub = subjects?.find(s => s.id === e.subjectId);
              return (
                <div key={e.id} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <div className="absolute -top-6 hidden group-hover:block bg-surface-lighter text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {sub?.icon} {Math.round(pct)}%
                  </div>
                  <div className="w-full rounded-t-sm bg-gold/70 transition-all" style={{ height: `${pct}%` }} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {(!exams || exams.length === 0) ? (
        <EmptyState icon="📊" title="No mock exams" description="Record your practice exam results to track your improvement." />
      ) : (
        <div className="space-y-3">
          {[...exams].reverse().map(e => {
            const sub = subjects?.find(s => s.id === e.subjectId);
            const pct = Math.round((e.obtainedMarks / e.totalMarks) * 100);
            const grade = e.grade || getGrade(e.obtainedMarks, e.totalMarks);
            return (
              <Card key={e.id} hover>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl">
                    {sub?.icon || "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{sub?.name || "Unknown"}</h3>
                      <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>{grade}</span>
                      <Badge color={pct >= 75 ? "green" : pct >= 50 ? "gold" : "red"}>{pct}%</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {e.date} • {e.obtainedMarks}/{e.totalMarks} marks • {e.timeTaken}min
                    </p>
                    {e.weakTopics && <p className="text-xs text-accent-red mt-1">Weak: {e.weakTopics}</p>}
                    {e.notes && <p className="text-xs text-text-secondary mt-1">{e.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(e.id)}>✕</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editExam ? "Edit Exam" : "Add Mock Exam"} size="lg">
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "Select Subject" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Marks" type="number" value={String(form.totalMarks)} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} />
            <Input label="Obtained Marks" type="number" value={String(form.obtainedMarks)} onChange={e => setForm({ ...form, obtainedMarks: Number(e.target.value) })} />
          </div>
          <Input label="Time Taken (min)" type="number" value={String(form.timeTaken)} onChange={e => setForm({ ...form, timeTaken: Number(e.target.value) })} />
          <Input label="Wrong Answers" value={form.wrongAnswers} onChange={e => setForm({ ...form, wrongAnswers: e.target.value })} placeholder="Question numbers" />
          <Input label="Weak Topics" value={form.weakTopics} onChange={e => setForm({ ...form, weakTopics: e.target.value })} placeholder="Topics to improve" />
          <TextArea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editExam ? "Update" : "Add Exam"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
