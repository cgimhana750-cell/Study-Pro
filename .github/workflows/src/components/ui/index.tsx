"use client";

import { motion } from "framer-motion";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ── Card ──
export function Card({
  children, className = "", hover = false, gold = false,
}: {
  children: ReactNode; className?: string; hover?: boolean; gold?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={`${gold ? "glass-gold" : "glass"} rounded-2xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ── Button ──
export function Button({
  children, variant = "primary", size = "md", className = "", ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: "bg-gold text-bg-dark hover:bg-gold-light active:bg-gold-dark shadow-lg shadow-gold/20",
    secondary: "bg-surface-lighter text-text-primary hover:bg-surface-light border border-gold/20",
    danger: "bg-accent-red/20 text-accent-red hover:bg-accent-red/30 border border-accent-red/20",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-surface-lighter",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Input ──
export function Input({ label, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
      <input className={`w-full text-sm ${className}`} {...props} />
    </div>
  );
}

// ── Select ──
export function Select({
  label, options, className = "", ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
      <select className={`w-full text-sm ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── TextArea ──
export function TextArea({ label, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-text-secondary font-medium">{label}</label>}
      <textarea className={`w-full text-sm min-h-[80px] ${className}`} {...props} />
    </div>
  );
}

// ── Progress Bar ──
export function ProgressBar({ value, max = 100, color = "bg-gold", className = "" }: {
  value: number; max?: number; color?: string; className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-2 bg-surface-lighter rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

// ── Badge ──
export function Badge({ children, color = "gold" }: { children: ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    gold: "bg-gold/20 text-gold",
    green: "bg-accent-green/20 text-accent-green",
    red: "bg-accent-red/20 text-accent-red",
    blue: "bg-accent-blue/20 text-accent-blue",
    purple: "bg-accent-purple/20 text-accent-purple",
    orange: "bg-accent-orange/20 text-accent-orange",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gold}`}>
      {children}
    </span>
  );
}

// ── Modal ──
export function Modal({
  open, onClose, title, children, size = "md",
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative glass rounded-2xl p-6 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gold">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-xl">✕</button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ── Stat Card ──
export function StatCard({
  icon, label, value, sub, color = "text-gold",
}: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <Card hover className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-text-secondary text-xs">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-text-secondary text-xs mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ── Empty State ──
export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-md">{description}</p>
    </div>
  );
}

// ── Page Header ──
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold gold-shimmer">{title}</h1>
        {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
