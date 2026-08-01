"use client";

import { useState } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, PageHeader } from "@/components/ui";

export default function BackupPage() {
  const [status, setStatus] = useState("");
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setStatus("Exporting...");
    try {
      const res = await fetch("/api/backup");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `study-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("✅ Backup exported successfully!");
    } catch {
      setStatus("❌ Export failed. Please try again.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatus("Importing...");
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setStatus(result.ok ? "✅ Backup restored successfully!" : `❌ ${result.message}`);
    } catch {
      setStatus("❌ Invalid backup file. Please check the format.");
    }
    setImporting(false);
  };

  return (
    <AppShell>
      <PageHeader title="Backup & Restore" subtitle="Keep your data safe — export and import your study data" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Export */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center text-2xl flex-shrink-0">
              💾
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Export Backup</h3>
              <p className="text-text-secondary text-sm mb-4">
                Download a complete JSON backup of all your study data. This includes subjects,
                chapters, study sessions, homework, notes, and more.
              </p>
              <Button onClick={handleExport}>📥 Download Backup</Button>
            </div>
          </div>
        </Card>

        {/* Import */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-2xl flex-shrink-0">
              📤
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Restore Backup</h3>
              <p className="text-text-secondary text-sm mb-4">
                Upload a previously exported JSON backup file. This will add the data
                to your current database (it won&apos;t overwrite existing data).
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-xl cursor-pointer hover:bg-accent-blue/30 transition-all text-sm font-medium">
                📁 Choose Backup File
                <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
              </label>
            </div>
          </div>
        </Card>

        {/* Status */}
        {status && (
          <Card>
            <p className="text-center text-sm">{status}</p>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <h3 className="text-gold font-semibold mb-3">💡 Tips</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Export your data regularly to prevent data loss</li>
            <li>• Keep backup files in a safe location (cloud storage, USB drive)</li>
            <li>• The backup includes ALL your data: subjects, sessions, homework, notes, etc.</li>
            <li>• Importing a backup adds data — it won&apos;t delete existing records</li>
            <li>• Your data auto-saves to the database as you use the app</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
