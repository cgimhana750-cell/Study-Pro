"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Input, Select, TextArea, Modal, PageHeader, Badge, EmptyState } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";

interface Note {
  id: number; subjectId: number | null; title: string; content: string;
  tags: string; pinned: boolean; createdAt: string; updatedAt: string;
}
interface Subject { id: number; name: string; icon: string; }

export default function NotesPage() {
  const { data: notes, refetch } = useFetch<Note[]>("/api/notes");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [form, setForm] = useState({ subjectId: "", title: "", content: "", tags: "" });

  const openCreate = () => {
    setEditNote(null);
    setForm({ subjectId: "", title: "", content: "", tags: "" });
    setShowModal(true);
  };

  const openEdit = (n: Note) => {
    setEditNote(n);
    setForm({
      subjectId: n.subjectId ? String(n.subjectId) : "",
      title: n.title, content: n.content || "", tags: n.tags || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    const data = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    if (editNote) {
      await api("/api/notes", "PUT", { id: editNote.id, ...data });
    } else {
      await api("/api/notes", "POST", data);
    }
    setShowModal(false);
    refetch();
  };

  const togglePin = async (n: Note) => {
    await api("/api/notes", "PUT", { id: n.id, pinned: !n.pinned });
    refetch();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this note?")) return;
    await api("/api/notes", "DELETE", { id });
    refetch();
  };

  let filtered = (notes || []).filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.tags || "").toLowerCase().includes(search.toLowerCase());
    const matchSubject = !filterSubject || String(n.subjectId) === filterSubject;
    return matchSearch && matchSubject;
  });

  // Sort: pinned first, then by date
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <AppShell>
      <PageHeader
        title="Notes"
        subtitle={`${(notes || []).length} notes`}
        action={<Button onClick={openCreate}>+ New Note</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="!w-56" />
        <Select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          options={[{ value: "", label: "All Subjects" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📓" title="No notes" description="Create your first note to start building your knowledge base." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(n => {
            const sub = subjects?.find(s => s.id === n.subjectId);
            return (
              <Card key={n.id} hover className="flex flex-col">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold flex-1 min-w-0 truncate">{n.pinned && "📌 "}{n.title}</h3>
                  {sub && <Badge>{sub.icon} {sub.name}</Badge>}
                </div>
                <p className="text-sm text-text-secondary flex-1 line-clamp-4 mb-3 whitespace-pre-wrap">
                  {n.content || "No content"}
                </p>
                {n.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {n.tags.split(",").map((tag, i) => (
                      <span key={i} className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t border-gold/10 mt-auto">
                  <Button size="sm" variant="ghost" onClick={() => togglePin(n)}>{n.pinned ? "Unpin" : "📌 Pin"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(n)}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(n.id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editNote ? "Edit Note" : "New Note"} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
            options={[{ value: "", label: "General" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          <TextArea label="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            className="!min-h-[200px]" placeholder="Write your notes here..." />
          <Input label="Tags" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Comma separated tags" />
          <div className="flex gap-3">
            <Button onClick={handleSave}>{editNote ? "Update" : "Create"}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
