"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, Modal, PageHeader, Badge } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr } from "@/lib/utils";

interface CalendarEvent {
  id: number; title: string; date: string; time: string; type: string;
  subjectId: number | null; description: string; color: string;
}
interface Subject { id: number; name: string; icon: string; }

const EVENT_TYPES = [
  { value: "general", label: "General" },
  { value: "class", label: "Tuition Class" },
  { value: "homework", label: "Homework Due" },
  { value: "revision", label: "Revision" },
  { value: "exam", label: "Exam" },
  { value: "reminder", label: "Reminder" },
];

export default function CalendarPage() {
  const { data: events, refetch } = useFetch<CalendarEvent[]>("/api/calendar");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: todayStr(), time: "", type: "general", subjectId: "", description: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const days: { date: string; day: number; inMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d.toISOString().split("T")[0], day: d.getDate(), inMonth: false });
    }
    // Current month
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      days.push({ date: date.toISOString().split("T")[0], day: d, inMonth: true });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date: date.toISOString().split("T")[0], day: d, inMonth: false });
    }
    return days;
  }, [year, month]);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    await api("/api/calendar", "POST", {
      ...form, subjectId: form.subjectId ? Number(form.subjectId) : null,
    });
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await api("/api/calendar", "DELETE", { id });
    refetch();
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const typeColors: Record<string, string> = {
    general: "bg-gold/30", class: "bg-accent-blue/30", homework: "bg-accent-orange/30",
    revision: "bg-accent-purple/30", exam: "bg-accent-red/30", reminder: "bg-accent-green/30",
  };

  const today = todayStr();

  // Today's events for the sidebar
  const todayEvents = (events || []).filter(e => e.date === today);

  return (
    <AppShell>
      <PageHeader
        title="Calendar"
        subtitle={monthName}
        action={<Button onClick={() => { setForm({ ...form, date: todayStr() }); setShowModal(true); }}>+ Add Event</Button>}
      />

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={prevMonth}>← Prev</Button>
        <Button variant="ghost" onClick={goToday}>Today</Button>
        <Button variant="ghost" onClick={nextMonth}>Next →</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3">
          <div className="grid grid-cols-7 gap-px">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs text-gold font-medium py-2">{d}</div>
            ))}
            {daysInMonth.map((d, i) => {
              const dayEvents = (events || []).filter(e => e.date === d.date);
              const isToday = d.date === today;
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1 border border-gold/5 rounded-lg transition-colors cursor-pointer hover:bg-surface-lighter
                    ${!d.inMonth ? "opacity-30" : ""}
                    ${isToday ? "bg-gold/10 border-gold/30" : ""}`}
                  onClick={() => { setForm({ ...form, date: d.date }); setShowModal(true); }}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-gold" : "text-text-secondary"}`}>{d.day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <div key={e.id} className={`text-xs px-1 py-0.5 rounded truncate ${typeColors[e.type] || typeColors.general}`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-text-secondary">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Sidebar - Today's Events */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-gold font-semibold mb-3">📅 Today&apos;s Events</h3>
            {todayEvents.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">No events today</p>
            ) : (
              <div className="space-y-2">
                {todayEvents.map(e => (
                  <div key={e.id} className="flex items-start gap-2 p-2 bg-surface-lighter rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-xs text-text-secondary">{e.time || "All day"} • {e.type}</p>
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="text-accent-red text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Legend */}
          <Card>
            <h3 className="text-gold font-semibold mb-3">🎨 Legend</h3>
            <div className="space-y-1">
              {EVENT_TYPES.map(t => (
                <div key={t.value} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${typeColors[t.value]}`} />
                  <span className="text-xs text-text-secondary">{t.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Exam Countdown */}
          <Card gold>
            <h3 className="text-gold font-semibold mb-2 text-sm">📋 O/L Exams</h3>
            <p className="text-xs text-text-secondary">Dec 8–17, 2026</p>
          </Card>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Event">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={EVENT_TYPES} />
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "None" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleAdd}>Add Event</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
