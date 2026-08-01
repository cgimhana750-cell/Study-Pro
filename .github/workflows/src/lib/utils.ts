import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

// Exam date
export const EXAM_START = new Date("2026-12-08T00:00:00");
export const EXAM_END = new Date("2026-12-17T23:59:59");

// Default O/L subjects
export const DEFAULT_SUBJECTS = [
  { name: "Sinhala", icon: "📖", color: "#D4AF37" },
  { name: "English", icon: "📘", color: "#5B8DEF" },
  { name: "Mathematics", icon: "📐", color: "#2ED573" },
  { name: "Science", icon: "🔬", color: "#A855F7" },
  { name: "History", icon: "🏛️", color: "#FF8C42" },
  { name: "Commerce", icon: "💼", color: "#FF4757" },
  { name: "ICT", icon: "💻", color: "#00D2FF" },
  { name: "Drama", icon: "🎭", color: "#FF6B9D" },
];

export function getCountdown() {
  const now = new Date();
  const diff = EXAM_START.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, total: diff };
}

export function formatDate(d: string | Date) {
  return format(new Date(d), "MMM dd, yyyy");
}

export function formatDateTime(d: string | Date) {
  return format(new Date(d), "MMM dd, yyyy HH:mm");
}

export function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 75) return "A";
  if (pct >= 65) return "B";
  if (pct >= 55) return "C";
  if (pct >= 35) return "S";
  return "W";
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: "text-accent-green", B: "text-accent-blue", C: "text-gold",
    S: "text-accent-orange", W: "text-accent-red",
  };
  return colors[grade] || "text-text-secondary";
}

export const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "Education is the most powerful weapon you can use to change the world.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Push yourself, because no one else is going to do it for you.",
  "Your limitation—it's only your imagination.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Every expert was once a beginner.",
  "Work hard in silence, let success make the noise.",
  "Study hard, for the well is deep, and our brains are shallow.",
];

export function randomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export function priorityLabel(p: number) {
  return ["", "Very Low", "Low", "Medium", "High", "Critical"][p] || "Medium";
}

export function priorityColor(p: number) {
  return ["", "text-text-secondary", "text-accent-blue", "text-gold", "text-accent-orange", "text-accent-red"][p] || "text-gold";
}

export function difficultyLabel(d: number) {
  return ["", "Very Easy", "Easy", "Medium", "Hard", "Very Hard"][d] || "Medium";
}
