"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { priorityLabel, priorityColor, todayStr } from "@/lib/utils";

interface Todo {
  id: number; title: string; description: string; priority: number;
  completed: boolean; dueDate: string; recurring: string;
}

export default function TodosPage() {
  const { data: todos, refetch } = useFetch<Todo[]>("/api/todos");
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState("active");
  const [form, setForm] = useState({ title: "", description: "", priority: 3, dueDate: "", recurring: "none" });

  const openCreate = () => {
    setEditTodo(null);
    setForm({ title: "", description: "", priority: 3, dueDate: "", recurring: "none" });
    setShowModal(true);
  };

  const openEdit = (t: Todo) => {
    setEditTodo(t);
    setForm({ title: t.title, description: t.description || "", priority: t.priority, dueDate: t.dueDate || "", recurring: t.recurring || "none" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editTodo) {
      await api("/api/todos", "PUT", { id: editTodo.id, ...form });
    } else {
      await api("/api/todos", "POST", form);
    }
    setShowModal(false);
    refetch();
  };

  const toggleComplete = async (t: Todo) => {
    await api("/api/todos", "PUT", { id: t.id, completed: !t.completed });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await api("/api/todos", "DELETE", { id });
    refetch();
  };

  const filtered = (todos || []).filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pending = (todos || []).filter(t => !t.completed).length;
  const completed = (todos || []).filter(t => t.completed).length;

  return (
    <AppShell>
      <PageHeader
        title="To-Do List"
        subtitle={`${pending} pending • ${completed} completed`}
        action={<Button onClick={openCreate}>+ Add Task</Button>}
      />

      <div className="flex gap-3 mb-6">
        {[
          { value: "active", label: `Active (${pending})` },
          { value: "completed", label: `Completed (${completed})` },
          { value: "all", label: `All (${(todos || []).length})` },
        ].map(f => (
          <Button key={f.value} size="sm" variant={filter === f.value ? "primary" : "ghost"} onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="✅" title={filter === "active" ? "All done!" : "No tasks"} description="Create tasks to organize your study workflow." />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} hover>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleComplete(t)} className="text-xl mt-0.5 flex-shrink-0">
                  {t.completed ? "✅" : "⬜"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${t.completed ? "line-through text-text-secondary" : ""}`}>{t.title}</h3>
                    <span className={`text-xs font-medium ${priorityColor(t.priority)}`}>{priorityLabel(t.priority)}</span>
                    {t.recurring !== "none" && <Badge color="purple">🔄 {t.recurring}</Badge>}
                    {t.dueDate && t.dueDate < todayStr() && !t.completed && <Badge color="red">Overdue</Badge>}
                  </div>
                  {t.description && <p className="text-sm text-text-secondary mt-1">{t.description}</p>}
                  {t.dueDate && <p className="text-xs text-text-secondary mt-1">Due: {t.dueDate}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>✕</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTodo ? "Edit Task" : "Add Task"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextArea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={String(form.priority)} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
              options={[{value:"1",label:"Very Low"},{value:"2",label:"Low"},{value:"3",label:"Medium"},{value:"4",label:"High"},{value:"5",label:"Critical"}]} />
            <Select label="Recurring" value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value })}
              options={[{value:"none",label:"None"},{value:"daily",label:"Daily"},{value:"weekly",label:"Weekly"},{value:"monthly",label:"Monthly"}]} />
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editTodo ? "Update" : "Add Task"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
