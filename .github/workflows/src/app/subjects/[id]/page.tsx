"use client";

import { useState, use } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { priorityLabel, difficultyLabel } from "@/lib/utils";
import Link from "next/link";

interface Chapter {
  id: number; subjectId: number; name: string; status: string; progress: number;
  difficulty: number; priority: number; timeSpent: number; notes: string; revisionCount: number;
}
interface Subject { id: number; name: string; icon: string; color: string; }

export default function ChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: chapters, refetch } = useFetch<Chapter[]>(`/api/chapters?subjectId=${id}`);
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const subject = subjects?.find(s => s.id === Number(id));

  const [showModal, setShowModal] = useState(false);
  const [editChapter, setEditChapter] = useState<Chapter | null>(null);
  const [form, setForm] = useState({ name: "", status: "not_started", difficulty: 3, priority: 3, notes: "" });

  const openCreate = () => {
    setEditChapter(null);
    setForm({ name: "", status: "not_started", difficulty: 3, priority: 3, notes: "" });
    setShowModal(true);
  };

  const openEdit = (c: Chapter) => {
    setEditChapter(c);
    setForm({ name: c.name, status: c.status, difficulty: c.difficulty, priority: c.priority, notes: c.notes || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editChapter) {
      await api("/api/chapters", "PUT", { id: editChapter.id, ...form });
    } else {
      await api("/api/chapters", "POST", { subjectId: Number(id), ...form });
    }
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (cid: number) => {
    if (!confirm("Delete this chapter?")) return;
    await api("/api/chapters", "DELETE", { id: cid });
    refetch();
  };

  const updateProgress = async (c: Chapter, progress: number) => {
    const status = progress >= 100 ? "completed" : progress > 0 ? "in_progress" : "not_started";
    await api("/api/chapters", "PUT", { id: c.id, progress, status });
    refetch();
  };

  const statusColors: Record<string, string> = {
    not_started: "orange", in_progress: "blue", completed: "green", revision: "purple",
  };

  return (
    <AppShell>
      <PageHeader
        title={`${subject?.icon || "📘"} ${subject?.name || "Subject"} — Chapters`}
        subtitle={`${(chapters || []).length} chapters`}
        action={
          <div className="flex gap-2">
            <Link href="/subjects"><Button variant="secondary">← Back</Button></Link>
            <Button onClick={openCreate}>+ Add Chapter</Button>
          </div>
        }
      />

      {(!chapters || chapters.length === 0) ? (
        <EmptyState icon="📖" title="No chapters yet" description="Add chapters for this subject to track your progress." />
      ) : (
        <div className="space-y-3">
          {chapters.map((c) => (
            <Card key={c.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{c.name}</h3>
                    <Badge color={statusColors[c.status] || "gold"}>
                      {c.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                    <span>Priority: {priorityLabel(c.priority)}</span>
                    <span>Difficulty: {difficultyLabel(c.difficulty)}</span>
                    <span>Time: {Math.round(c.timeSpent / 60)}h {c.timeSpent % 60}m</span>
                    <span>Revisions: {c.revisionCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-64">
                  <div className="flex-1">
                    <ProgressBar value={c.progress} max={100} />
                  </div>
                  <span className="text-sm text-gold font-medium w-10 text-right">{c.progress}%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gold/10">
                <input
                  type="range" min="0" max="100" value={c.progress}
                  onChange={e => updateProgress(c, Number(e.target.value))}
                  className="flex-1 accent-gold !border-0 !p-0 !bg-transparent"
                />
                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editChapter ? "Edit Chapter" : "Add Chapter"}>
        <div className="space-y-4">
          <Input label="Chapter Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
            options={[
              { value: "not_started", label: "Not Started" },
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "revision", label: "Revision" },
            ]} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={String(form.priority)} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
              options={[{value:"1",label:"Very Low"},{value:"2",label:"Low"},{value:"3",label:"Medium"},{value:"4",label:"High"},{value:"5",label:"Critical"}]} />
            <Select label="Difficulty" value={String(form.difficulty)} onChange={e => setForm({ ...form, difficulty: Number(e.target.value) })}
              options={[{value:"1",label:"Very Easy"},{value:"2",label:"Easy"},{value:"3",label:"Medium"},{value:"4",label:"Hard"},{value:"5",label:"Very Hard"}]} />
          </div>
          <TextArea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editChapter ? "Update" : "Add Chapter"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
