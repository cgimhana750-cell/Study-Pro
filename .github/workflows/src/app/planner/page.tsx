"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, Modal, PageHeader, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr } from "@/lib/utils";

interface StudySession {
  id: number; subjectId: number | null; date: string; timeSlot: string;
  topic: string; duration: number; completed: boolean; notes: string;
}
interface Subject { id: number; name: string; icon: string; }

const TIME_SLOTS = [
  { value: "morning", label: "🌅 Morning (6am–12pm)" },
  { value: "afternoon", label: "☀️ Afternoon (12pm–5pm)" },
  { value: "evening", label: "🌆 Evening (5pm–9pm)" },
  { value: "night", label: "🌙 Night (9pm–12am)" },
];

export default function PlannerPage() {
  const [date, setDate] = useState(todayStr());
  const { data: sessions, refetch } = useFetch<StudySession[]>(`/api/study-sessions?date=${date}`, [date]);
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subjectId: "", timeSlot: "morning", topic: "", duration: 60, notes: "" });

  const handleAdd = async () => {
    if (!form.topic.trim()) return;
    await api("/api/study-sessions", "POST", { ...form, date, subjectId: form.subjectId ? Number(form.subjectId) : null });
    await api("/api/activity", "POST", { action: "Added study session", detail: form.topic, category: "planner" });
    setShowModal(false);
    setForm({ subjectId: "", timeSlot: "morning", topic: "", duration: 60, notes: "" });
    refetch();
  };

  const toggleComplete = async (s: StudySession) => {
    await api("/api/study-sessions", "PUT", { id: s.id, completed: !s.completed });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await api("/api/study-sessions", "DELETE", { id });
    refetch();
  };

  // Carry forward function
  const carryForward = async () => {
    const incomplete = (sessions || []).filter(s => !s.completed);
    if (incomplete.length === 0) return;
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    for (const s of incomplete) {
      await api("/api/study-sessions", "POST", {
        subjectId: s.subjectId, date: tomorrowStr, timeSlot: s.timeSlot,
        topic: s.topic, duration: s.duration, notes: s.notes,
      });
    }
    alert(`${incomplete.length} session(s) carried to ${tomorrowStr}`);
  };

  const totalHours = (sessions || []).reduce((a, s) => a + s.duration, 0) / 60;
  const completedHours = (sessions || []).filter(s => s.completed).reduce((a, s) => a + s.duration, 0) / 60;

  const grouped = TIME_SLOTS.map(slot => ({
    ...slot,
    sessions: (sessions || []).filter(s => s.timeSlot === slot.value),
  }));

  return (
    <AppShell>
      <PageHeader
        title="Study Planner"
        subtitle={`${completedHours.toFixed(1)}h / ${totalHours.toFixed(1)}h completed`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={carryForward}>📋 Carry Forward</Button>
            <Button onClick={() => setShowModal(true)}>+ Add Session</Button>
          </div>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => {
          const d = new Date(date); d.setDate(d.getDate() - 1);
          setDate(d.toISOString().split("T")[0]);
        }}>←</Button>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="!w-44" />
        <Button variant="ghost" onClick={() => {
          const d = new Date(date); d.setDate(d.getDate() + 1);
          setDate(d.toISOString().split("T")[0]);
        }}>→</Button>
        <Button variant="ghost" onClick={() => setDate(todayStr())}>Today</Button>
      </div>

      <div className="space-y-6">
        {grouped.map(slot => (
          <div key={slot.value}>
            <h3 className="text-gold font-semibold mb-3">{slot.label}</h3>
            {slot.sessions.length === 0 ? (
              <Card className="text-center py-4">
                <p className="text-text-secondary text-sm">No sessions planned</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {slot.sessions.map(s => {
                  const sub = subjects?.find(sub => sub.id === s.subjectId);
                  return (
                    <Card key={s.id} hover>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleComplete(s)} className="text-xl">
                          {s.completed ? "✅" : "⬜"}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${s.completed ? "line-through text-text-secondary" : ""}`}>{s.topic}</p>
                          <p className="text-xs text-text-secondary">{sub?.icon} {sub?.name || "General"} • {s.duration}min</p>
                        </div>
                        <Badge color={s.completed ? "green" : "gold"}>{s.completed ? "Done" : "Pending"}</Badge>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>✕</Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Study Session">
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "General" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <Select label="Time Slot" value={form.timeSlot} onChange={e => setForm({ ...form, timeSlot: e.target.value })}
            options={TIME_SLOTS} />
          <Input label="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="What will you study?" />
          <Input label="Duration (minutes)" type="number" value={String(form.duration)} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
          <div className="flex gap-3">
            <Button onClick={handleAdd}>Add Session</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
