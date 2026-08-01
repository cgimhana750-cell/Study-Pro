"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Select, Modal, PageHeader, Badge, EmptyState, StatCard } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr } from "@/lib/utils";

interface Revision { id: number; subjectId: number; chapterId: number | null; date: string; type: string; quality: number; notes: string; }
interface Subject { id: number; name: string; icon: string; color: string; revisionCount: number; averageScore: number; }
interface Chapter { id: number; subjectId: number; name: string; revisionCount: number; }

export default function RevisionPage() {
  const { data: revisions, refetch } = useFetch<Revision[]>("/api/revisions");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");
  const { data: chapters } = useFetch<Chapter[]>("/api/chapters");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subjectId: "", chapterId: "", type: "daily", quality: 3, notes: "" });

  const handleAdd = async () => {
    if (!form.subjectId) return;
    await api("/api/revisions", "POST", {
      subjectId: Number(form.subjectId),
      chapterId: form.chapterId ? Number(form.chapterId) : null,
      date: todayStr(), type: form.type, quality: form.quality, notes: form.notes,
    });
    // Update subject revision count
    const sub = subjects?.find(s => s.id === Number(form.subjectId));
    if (sub) {
      await api("/api/subjects", "PUT", { id: sub.id, revisionCount: sub.revisionCount + 1 });
    }
    setShowModal(false);
    setForm({ subjectId: "", chapterId: "", type: "daily", quality: 3, notes: "" });
    refetch();
  };

  const handleDelete = async (id: number) => {
    await api("/api/revisions", "DELETE", { id });
    refetch();
  };

  // Build revision heatmap for last 30 days
  const heatmap = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const count = (revisions || []).filter(r => r.date === ds).length;
      days.push({ date: ds, count });
    }
    return days;
  }, [revisions]);

  // Smart suggestions: subjects with lowest revision count or low scores
  const suggestions = useMemo(() => {
    if (!subjects) return [];
    return [...subjects]
      .sort((a, b) => a.revisionCount - b.revisionCount)
      .slice(0, 3);
  }, [subjects]);

  const subjectChapters = chapters?.filter(c => c.subjectId === Number(form.subjectId)) || [];
  const todayRevisions = (revisions || []).filter(r => r.date === todayStr());
  const weekRevisions = (revisions || []).filter(r => {
    const d = new Date(r.date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  return (
    <AppShell>
      <PageHeader
        title="Revision System"
        subtitle="Smart revision tracking with heatmap"
        action={<Button onClick={() => setShowModal(true)}>+ Log Revision</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="📅" label="Today" value={todayRevisions.length} sub="revisions" />
        <StatCard icon="📊" label="This Week" value={weekRevisions.length} sub="revisions" />
        <StatCard icon="🔄" label="Total" value={(revisions || []).length} sub="all time" />
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <h3 className="text-gold font-semibold mb-3">📊 Revision Heatmap (Last 30 Days)</h3>
        <div className="flex gap-1 flex-wrap">
          {heatmap.map(d => (
            <div key={d.date} title={`${d.date}: ${d.count} revisions`}
              className="w-6 h-6 rounded-sm transition-colors"
              style={{
                backgroundColor: d.count === 0 ? "rgba(212,175,55,0.05)"
                  : d.count <= 2 ? "rgba(212,175,55,0.2)"
                  : d.count <= 4 ? "rgba(212,175,55,0.4)"
                  : "rgba(212,175,55,0.8)",
              }} />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
          <span>Less</span>
          {[0.05, 0.2, 0.4, 0.8].map((o, i) => (
            <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(212,175,55,${o})` }} />
          ))}
          <span>More</span>
        </div>
      </Card>

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-gold font-semibold mb-3">💡 Suggested for Revision</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <div key={s.id} className="flex items-center gap-2 bg-surface-lighter rounded-lg px-3 py-2">
                <span>{s.icon}</span>
                <span className="text-sm">{s.name}</span>
                <Badge color="orange">{s.revisionCount} revisions</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Revisions */}
      <h3 className="text-gold font-semibold mb-3">🕐 Recent Revisions</h3>
      {(!revisions || revisions.length === 0) ? (
        <EmptyState icon="🔄" title="No revisions yet" description="Start logging your revision sessions to track progress." />
      ) : (
        <div className="space-y-2">
          {[...revisions].reverse().slice(0, 20).map(r => {
            const sub = subjects?.find(s => s.id === r.subjectId);
            const ch = chapters?.find(c => c.id === r.chapterId);
            const qualityColors = ["", "text-accent-red", "text-accent-orange", "text-gold", "text-accent-blue", "text-accent-green"];
            return (
              <Card key={r.id} hover>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{sub?.icon || "📖"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sub?.name || "Unknown"} {ch ? `— ${ch.name}` : ""}</p>
                    <p className="text-xs text-text-secondary">{r.date} • {r.type} • Quality: <span className={qualityColors[r.quality]}>{r.quality}/5</span></p>
                  </div>
                  <Badge color={r.type === "daily" ? "gold" : r.type === "weekly" ? "blue" : "purple"}>{r.type}</Badge>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(r.id)}>✕</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Revision">
        <div className="space-y-4">
          <Select label="Subject" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value, chapterId: "" })}
            options={[{ value: "", label: "Select Subject" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
          {subjectChapters.length > 0 && (
            <Select label="Chapter (optional)" value={form.chapterId} onChange={e => setForm({ ...form, chapterId: e.target.value })}
              options={[{ value: "", label: "All/General" }, ...subjectChapters.map(c => ({ value: String(c.id), label: c.name }))]} />
          )}
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            options={[{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }]} />
          <Select label="Quality" value={String(form.quality)} onChange={e => setForm({ ...form, quality: Number(e.target.value) })}
            options={[{value:"1",label:"1 - Poor"},{value:"2",label:"2 - Below Average"},{value:"3",label:"3 - Average"},{value:"4",label:"4 - Good"},{value:"5",label:"5 - Excellent"}]} />
          <div className="flex gap-3">
            <Button onClick={handleAdd}>Log Revision</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
