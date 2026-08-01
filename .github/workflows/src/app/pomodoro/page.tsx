"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AppShell from "@/components/shell/AppShell";
import { Card, Button, Select, PageHeader, StatCard } from "@/components/ui";
import { useFetch, api } from "@/hooks/useApi";
import { todayStr } from "@/lib/utils";
import { motion } from "framer-motion";

interface PomodoroSession { id: number; duration: number; completed: boolean; date: string; }
interface Subject { id: number; name: string; icon: string; }

const PRESETS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

export default function PomodoroPage() {
  const { data: todaySessions, refetch } = useFetch<PomodoroSession[]>(`/api/pomodoro?date=${todayStr()}`);
  const { data: allSessions } = useFetch<PomodoroSession[]>("/api/pomodoro");
  const { data: subjects } = useFetch<Subject[]>("/api/subjects");

  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [subjectId, setSubjectId] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const completeSession = useCallback(async () => {
    if (!isBreak) {
      await api("/api/pomodoro", "POST", {
        date: todayStr(),
        duration,
        completed: true,
        subjectId: subjectId ? Number(subjectId) : null,
      });
      setSessions(s => s + 1);
      refetch();
      // Start break
      setIsBreak(true);
      setRemaining(5 * 60);
      setRunning(true);
    } else {
      setIsBreak(false);
      setRemaining(duration * 60);
      setRunning(false);
    }
  }, [isBreak, duration, subjectId, refetch]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current!);
            completeSession();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining, completeSession]);

  const selectPreset = (mins: number) => {
    setDuration(mins);
    setRemaining(mins * 60);
    setRunning(false);
    setIsBreak(false);
  };

  const toggleTimer = () => setRunning(!running);

  const resetTimer = () => {
    setRunning(false);
    setIsBreak(false);
    setRemaining(duration * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = isBreak
    ? ((5 * 60 - remaining) / (5 * 60)) * 100
    : ((duration * 60 - remaining) / (duration * 60)) * 100;

  const todayTotal = (todaySessions || []).filter(s => s.completed).reduce((a, s) => a + s.duration, 0);
  const allTotal = (allSessions || []).filter(s => s.completed).reduce((a, s) => a + s.duration, 0);

  return (
    <AppShell>
      {!focusMode && (
        <PageHeader
          title="Pomodoro Timer"
          subtitle="Stay focused, stay productive"
          action={<Button variant="secondary" onClick={() => setFocusMode(true)}>🎯 Focus Mode</Button>}
        />
      )}

      {focusMode && (
        <div className="fixed inset-0 bg-bg z-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-text-secondary text-sm mb-4">{isBreak ? "☕ Break Time" : "🎯 Focus Mode"}</p>
            <div className="text-8xl font-bold text-gold tabular-nums mb-6">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={toggleTimer} size="lg">{running ? "⏸ Pause" : "▶ Start"}</Button>
              <Button variant="secondary" size="lg" onClick={() => setFocusMode(false)}>Exit Focus</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Timer */}
        <Card gold className="text-center mb-6">
          <p className="text-text-secondary text-sm mb-2">{isBreak ? "☕ Break Time" : "🍅 Study Session"}</p>

          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="4" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="4"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gold tabular-nums">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center mb-4">
            <Button onClick={toggleTimer} size="lg">{running ? "⏸ Pause" : "▶ Start"}</Button>
            <Button variant="secondary" onClick={resetTimer}>🔄 Reset</Button>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {PRESETS.map(p => (
              <Button key={p.value} size="sm" variant={duration === p.value ? "primary" : "ghost"}
                onClick={() => selectPreset(p.value)}>
                {p.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Subject */}
        <Card className="mb-6">
          <Select label="Studying Subject" value={subjectId} onChange={e => setSubjectId(e.target.value)}
            options={[{ value: "", label: "General Study" }, ...(subjects || []).map(s => ({ value: String(s.id), label: `${s.icon} ${s.name}` }))]} />
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon="🍅" label="Today's Sessions" value={sessions + (todaySessions?.length || 0)} />
          <StatCard icon="⏱️" label="Today's Focus" value={`${Math.round(todayTotal / 60)}h ${todayTotal % 60}m`} />
          <StatCard icon="📊" label="Total Focus" value={`${Math.round(allTotal / 60)}h`} />
        </div>
      </div>
    </AppShell>
  );
}
