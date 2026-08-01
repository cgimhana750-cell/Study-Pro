"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr, priorityLabel, priorityColor } from "@/lib/utils";

interface HomeworkItem {
  id: number; subjectId: number | null; title: string; description: string;
  dueDate: string; priority: number; status: string;
}
interface Subject { id: number; name: string; icon: string; }

export default function HomeworkPage() {
  const { data: items, refetch } = useFetch<HomeworkItem[]>("/api/homework");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<HomeworkItem | null>(null);
  const [filter, setFilter] = useState("pending");
  const [form, setForm] = useState({ subjectId: "", title: "", description: "", dueDate: todayStr(), priority: 3 });

  const openCreate = () => {
    setEditItem(null);
    setForm({ subjectId: "", title: "", description: "", dueDate: todayStr(), priority: 3 });
    setShowModal(true);
  };

  const openEdit = (h: HomeworkItem) => {
    setEditItem(h);
    setForm({
      subjectId: h.subjectId ? String(h.subjectId) : "",
      title: h.title, description: h.description || "",
      dueDate: h.dueDate, priority: h.priority,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const data = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    if (editItem) {
      await api("/api/homework", "PUT", { id: editItem.id, ...data });
    } else {
      await api("/api/homework", "POST", data);
    }
    setShowModal(false);
    refetch();
  };

  const toggleStatus = async (h: HomeworkItem) => {
    const newStatus = h.status === "pending" ? "completed" : "pending";
    await api("/api/homework", "PUT", { id: h.id, status: newStatus });
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this homework?")) return;
    await api("/api/homework", "DELETE", { id });
    refetch();
  };

  const filtered = (items || []).filter(h => filter === "all" || h.status === filter);
  const overdue = (items || []).filter(h => h.status === "pending" && h.dueDate < todayStr());

  return (
    <AppShell>
      <PageHeader
        title="Homework Tracker"
        subtitle={`${(items || []).filter(h => h.status === "pending").length} pending • ${overdue.length} overdue`}
        action={<Button onClick={openCreate}>+ Add Homework</Button>}
      />

      <div className="flex gap-3 mb-6">
        {["pending", "completed", "all"].map(f => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "ghost"}
            onClick={() => setFilter(f)} className="capitalize">
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📝" title="No homework" description={filter === "pending" ? "All caught up! 🎉" : "No homework items found."} />
      ) : (
        <div className="space-y-3">
          {filtered.map(h => {
            const sub = subjects?.find(s => s.id === h.subjectId);
            const isOverdue = h.status === "pending" && h.dueDate < todayStr();
            return (
              <Card key={h.id} hover>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(h)} className="text-xl mt-0.5">
                    {h.status === "completed" ? "✅" : "⬜"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-medium ${h.status === "completed" ? "line-through text-text-secondary" : ""}`}>
                        {h.title}
                      </h3>
                      {isOverdue && <Badge color="red">Overdue</Badge>}
                      <Badge color={h.status === "completed" ? "green" : "gold"}>{h.status}</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {sub?.icon} {sub?.name || "General"} • Due: {h.dueDate} •{" "}
                      <span className={priorityColor(h.priority)}>{priorityLabel(h.priority)}</span>
                    </p>
                    {h.description && <p className="text-sm text-text-secondary mt-1">{h.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(h)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(h.id)}>✕</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? "Edit Homework" : "Add Homework"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "General" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <Select label="Priority" value={String(form.priority)} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
            options={[{value:"1",label:"Very Low"},{value:"2",label:"Low"},{value:"3",label:"Medium"},{value:"4",label:"High"},{value:"5",label:"Critical"}]} />
          <TextArea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editItem ? "Update" : "Add"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
