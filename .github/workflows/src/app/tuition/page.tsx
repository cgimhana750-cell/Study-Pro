"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";

interface TuitionClass {
  id: number; subjectId: number | null; teacher: string; institute: string; mode: string;
  day: string; time: string; duration: number; monthlyFee: number;
  totalClasses: number; attendedClasses: number; missedClasses: number;
  notes: string; active: boolean;
}
interface Subject { id: number; name: string; icon: string; }

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function TuitionPage() {
  const { data: classes, refetch } = useFetch<TuitionClass[]>("/api/tuition");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState<TuitionClass | null>(null);
  const [form, setForm] = useState({
    subjectId: "", teacher: "", institute: "", mode: "physical",
    day: "Monday", time: "08:00", duration: 60, monthlyFee: 0, notes: "",
  });

  const openCreate = () => {
    setEditClass(null);
    setForm({ subjectId: "", teacher: "", institute: "", mode: "physical", day: "Monday", time: "08:00", duration: 60, monthlyFee: 0, notes: "" });
    setShowModal(true);
  };

  const openEdit = (c: TuitionClass) => {
    setEditClass(c);
    setForm({
      subjectId: c.subjectId ? String(c.subjectId) : "",
      teacher: c.teacher, institute: c.institute || "", mode: c.mode,
      day: c.day, time: c.time, duration: c.duration,
      monthlyFee: c.monthlyFee, notes: c.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.teacher.trim()) return;
    const data = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    if (editClass) {
      await api("/api/tuition", "PUT", { id: editClass.id, ...data });
    } else {
      await api("/api/tuition", "POST", data);
    }
    setShowModal(false);
    refetch();
  };

  const markAttendance = async (c: TuitionClass, attended: boolean) => {
    await api("/api/tuition", "PUT", {
      id: c.id,
      totalClasses: c.totalClasses + 1,
      attendedClasses: attended ? c.attendedClasses + 1 : c.attendedClasses,
      missedClasses: attended ? c.missedClasses : c.missedClasses + 1,
    });
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    await api("/api/tuition", "DELETE", { id });
    refetch();
  };

  const totalFees = (classes || []).filter(c => c.active).reduce((a, c) => a + c.monthlyFee, 0);

  return (
    <AppShell>
      <PageHeader
        title="Tuition Classes"
        subtitle={`${(classes || []).length} classes • Rs. ${totalFees.toLocaleString()}/month total`}
        action={<Button onClick={openCreate}>+ Add Class</Button>}
      />

      {/* Weekly Schedule */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-3">📅 Weekly Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {DAYS.map(day => {
            const dayClasses = (classes || []).filter(c => c.day === day && c.active);
            return (
              <div key={day} className="bg-surface-lighter rounded-lg p-2">
                <p className="text-xs text-gold font-medium mb-1">{day.slice(0, 3)}</p>
                {dayClasses.length === 0 ? (
                  <p className="text-xs text-text-secondary">—</p>
                ) : (
                  dayClasses.map(c => (
                    <p key={c.id} className="text-xs text-text-primary truncate">{c.time} {c.teacher}</p>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {(!classes || classes.length === 0) ? (
        <EmptyState icon="🏫" title="No classes yet" description="Add your tuition classes to manage your schedule." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => {
            const sub = subjects?.find(s => s.id === c.subjectId);
            const attendance = c.totalClasses > 0 ? Math.round((c.attendedClasses / c.totalClasses) * 100) : 0;
            return (
              <Card key={c.id} hover>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-xl">
                    {sub?.icon || "🏫"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{c.teacher}</h3>
                    <p className="text-text-secondary text-xs">{sub?.name || "General"} • {c.institute || "N/A"}</p>
                  </div>
                  <Badge color={c.mode === "online" ? "blue" : "green"}>{c.mode}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Day/Time</span>
                    <p className="font-medium">{c.day} {c.time}</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Duration</span>
                    <p className="font-medium">{c.duration} min</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Fee</span>
                    <p className="font-medium">Rs. {c.monthlyFee.toLocaleString()}</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Attendance</span>
                    <p className="font-medium">{c.attendedClasses}/{c.totalClasses} ({attendance}%)</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gold/10">
                  <Button size="sm" variant="ghost" onClick={() => markAttendance(c, true)}>✅ Attended</Button>
                  <Button size="sm" variant="ghost" onClick={() => markAttendance(c, false)}>❌ Missed</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editClass ? "Edit Class" : "Add Class"}>
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "Select Subject" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <Input label="Teacher" value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} />
          <Input label="Institute" value={form.institute} onChange={e => setForm({ ...form, institute: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Mode" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}
              options={[{ value: "physical", label: "Physical" }, { value: "online", label: "Online" }]} />
            <Select label="Day" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })}
              options={DAYS.map(d => ({ value: d, label: d }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            <Input label="Duration (min)" type="number" value={String(form.duration)} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
          </div>
          <Input label="Monthly Fee (Rs.)" type="number" value={String(form.monthlyFee)} onChange={e => setForm({ ...form, monthlyFee: Number(e.target.value) })} />
          <TextArea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editClass ? "Update" : "Add Class"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
