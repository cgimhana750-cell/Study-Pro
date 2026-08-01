"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, ProgressBar, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { priorityLabel, difficultyLabel } from "@/lib/utils";
import Link from "next/link";

interface Subject {
  id: number; name: string; color: string; icon: string; teacher: string;
  priority: number; difficulty: number; totalChapters: number; completedChapters: number;
  revisionCount: number; averageScore: number; weakTopics: string; strongTopics: string;
  notes: string; resources: string; archived: boolean;
}

const ICONS = ["📖","📘","📐","🔬","🏛️","💼","💻","🎭","📚","🎨","🎵","⚽","🌍","📊","🧪"];
const COLORS = ["#D4AF37","#5B8DEF","#2ED573","#A855F7","#FF8C42","#FF4757","#00D2FF","#FF6B9D","#FFD93D","#6BCB77"];

export default function SubjectsPage() {
  const { data: subjects, refetch } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [filter, setFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("priority");
  const [form, setForm] = useState({
    name: "", color: "#D4AF37", icon: "📘", teacher: "", priority: 3,
    difficulty: 3, totalChapters: 0, weakTopics: "", strongTopics: "",
    notes: "", resources: "",
  });

  const openCreate = () => {
    setEditSubject(null);
    setForm({ name: "", color: "#D4AF37", icon: "📘", teacher: "", priority: 3, difficulty: 3, totalChapters: 0, weakTopics: "", strongTopics: "", notes: "", resources: "" });
    setShowModal(true);
  };

  const openEdit = (s: Subject) => {
    setEditSubject(s);
    setForm({
      name: s.name, color: s.color, icon: s.icon, teacher: s.teacher || "",
      priority: s.priority, difficulty: s.difficulty, totalChapters: s.totalChapters,
      weakTopics: s.weakTopics || "", strongTopics: s.strongTopics || "",
      notes: s.notes || "", resources: s.resources || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editSubject) {
      await api("/api/subjects", "PUT", { id: editSubject.id, ...form });
    } else {
      await api("/api/subjects", "POST", form);
    }
    await api("/api/activity", "POST", { action: editSubject ? "Updated subject" : "Added subject", detail: form.name, category: "subject" });
    setShowModal(false);
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this subject?")) return;
    await api("/api/subjects", "DELETE", { id });
    refetch();
  };

  const toggleArchive = async (s: Subject) => {
    await api("/api/subjects", "PUT", { id: s.id, archived: !s.archived });
    refetch();
  };

  let filtered = (subjects || []).filter(s => {
    if (filter === "active") return !s.archived;
    if (filter === "archived") return s.archived;
    return true;
  }).filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === "difficulty") filtered.sort((a, b) => b.difficulty - a.difficulty);
  else if (sort === "score") filtered.sort((a, b) => b.averageScore - a.averageScore);
  else filtered.sort((a, b) => b.priority - a.priority);

  return (
    <AppShell>
      <PageHeader
        title="Subjects"
        subtitle={`${filtered.length} subject${filtered.length !== 1 ? "s" : ""}`}
        action={<Button onClick={openCreate}>+ Add Subject</Button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} className="!w-48" />
        <Select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          options={[
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
            { value: "all", label: "All" },
          ]}
        />
        <Select
          value={sort}
          onChange={e => setSort(e.target.value)}
          options={[
            { value: "priority", label: "Sort: Priority" },
            { value: "name", label: "Sort: Name" },
            { value: "difficulty", label: "Sort: Difficulty" },
            { value: "score", label: "Sort: Score" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📚" title="No subjects found" description="Add your O/L subjects to start tracking your study progress." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const pct = s.totalChapters > 0 ? Math.round((s.completedChapters / s.totalChapters) * 100) : 0;
            return (
              <Card key={s.id} hover className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: s.color }} />
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: s.color + "20" }}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{s.name}</h3>
                    {s.teacher && <p className="text-text-secondary text-xs">👨‍🏫 {s.teacher}</p>}
                  </div>
                  {s.archived && <Badge color="orange">Archived</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Priority</span>
                    <p className="font-medium">{priorityLabel(s.priority)}</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Difficulty</span>
                    <p className="font-medium">{difficultyLabel(s.difficulty)}</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Chapters</span>
                    <p className="font-medium">{s.completedChapters}/{s.totalChapters}</p>
                  </div>
                  <div className="bg-surface-lighter rounded-lg p-2">
                    <span className="text-text-secondary">Avg Score</span>
                    <p className="font-medium">{s.averageScore > 0 ? `${s.averageScore}%` : "N/A"}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Progress</span>
                    <span style={{ color: s.color }}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} max={100} />
                </div>

                {(s.weakTopics || s.strongTopics) && (
                  <div className="text-xs space-y-1 mb-3">
                    {s.weakTopics && <p><span className="text-accent-red">Weak:</span> {s.weakTopics}</p>}
                    {s.strongTopics && <p><span className="text-accent-green">Strong:</span> {s.strongTopics}</p>}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-gold/10">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>Edit</Button>
                  <Link href={`/subjects/${s.id}`}>
                    <Button size="sm" variant="secondary">Chapters</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => toggleArchive(s)}>
                    {s.archived ? "Restore" : "Archive"}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editSubject ? "Edit Subject" : "Add Subject"} size="lg">
        <div className="space-y-4">
          <Input label="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
          <Input label="Teacher" value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} placeholder="e.g. Mr. Silva" />

          <div>
            <label className="text-xs text-text-secondary font-medium">Icon</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${form.icon === ic ? "bg-gold/30 ring-2 ring-gold" : "bg-surface-lighter hover:bg-surface-light"}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary font-medium">Color</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full ${form.color === c ? "ring-2 ring-gold ring-offset-2 ring-offset-surface" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Priority" value={String(form.priority)} onChange={e => setForm({ ...form, priority: Number(e.target.value) })}
              options={[{ value: "1", label: "Very Low" },{ value: "2", label: "Low" },{ value: "3", label: "Medium" },{ value: "4", label: "High" },{ value: "5", label: "Critical" }]} />
            <Select label="Difficulty" value={String(form.difficulty)} onChange={e => setForm({ ...form, difficulty: Number(e.target.value) })}
              options={[{ value: "1", label: "Very Easy" },{ value: "2", label: "Easy" },{ value: "3", label: "Medium" },{ value: "4", label: "Hard" },{ value: "5", label: "Very Hard" }]} />
          </div>

          <Input label="Total Chapters" type="number" value={String(form.totalChapters)} onChange={e => setForm({ ...form, totalChapters: Number(e.target.value) })} />
          <Input label="Weak Topics" value={form.weakTopics} onChange={e => setForm({ ...form, weakTopics: e.target.value })} placeholder="Comma separated" />
          <Input label="Strong Topics" value={form.strongTopics} onChange={e => setForm({ ...form, strongTopics: e.target.value })} placeholder="Comma separated" />
          <TextArea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <TextArea label="Resources" value={form.resources} onChange={e => setForm({ ...form, resources: e.target.value })} placeholder="Links, books, etc." />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave}>{editSubject ? "Update" : "Add Subject"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
