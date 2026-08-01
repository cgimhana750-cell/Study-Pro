"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Input, PageHeader, Badge, EmptyState } from "@/components/ui";

interface SearchResult { type: string; id: number; title: string; sub: string; }

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const typeIcons: Record<string, string> = {
    subject: "📚", chapter: "📖", homework: "📝", note: "📓", todo: "✅", class: "🏫",
  };
  const typeColors: Record<string, string> = {
    subject: "blue", chapter: "purple", homework: "orange", note: "green", todo: "gold", class: "red",
  };
  const typeLinks: Record<string, string> = {
    subject: "/subjects", chapter: "/subjects", homework: "/homework", note: "/notes", todo: "/todos", class: "/tuition",
  };

  return (
    <AppShell>
      <PageHeader title="Global Search" subtitle="Search across all your study data" />

      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <Input
            placeholder="🔍 Search subjects, notes, homework, classes, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="!text-lg !py-3"
            autoFocus
          />
        </Card>

        {loading && <p className="text-text-secondary text-center py-4">Searching...</p>}

        {!loading && query && results.length === 0 && (
          <EmptyState icon="🔍" title="No results found" description={`No matches for "${query}". Try a different search term.`} />
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-text-secondary text-sm mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            {results.map((r, i) => (
              <Card key={`${r.type}-${r.id}-${i}`} hover>
                <a href={typeLinks[r.type] || "/"} className="flex items-center gap-3">
                  <span className="text-xl">{typeIcons[r.type] || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{r.title}</p>
                    {r.sub && <p className="text-xs text-text-secondary">{r.sub}</p>}
                  </div>
                  <Badge color={typeColors[r.type] || "gold"}>{r.type}</Badge>
                </a>
              </Card>
            ))}
          </div>
        )}

        {!query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
            <p className="text-text-secondary text-sm">Type to search across all your study data instantly</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
