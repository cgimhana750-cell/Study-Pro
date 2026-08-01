"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", icon: "🏠", label: "Dashboard" },
  { href: "/subjects", icon: "📚", label: "Subjects" },
  { href: "/tuition", icon: "🏫", label: "Tuition Classes" },
  { href: "/planner", icon: "📅", label: "Study Planner" },
  { href: "/pomodoro", icon: "🍅", label: "Pomodoro Timer" },
  { href: "/homework", icon: "📝", label: "Homework" },
  { href: "/revision", icon: "🔄", label: "Revision" },
  { href: "/mock-exams", icon: "📊", label: "Mock Exams" },
  { href: "/notes", icon: "📓", label: "Notes" },
  { href: "/stats", icon: "📈", label: "Statistics" },
  { href: "/calendar", icon: "🗓️", label: "Calendar" },
  { href: "/todos", icon: "✅", label: "To-Do List" },
  { href: "/search", icon: "🔍", label: "Search" },
  { href: "/backup", icon: "💾", label: "Backup" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-gold/20">
        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-xl flex-shrink-0">
          🎓
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <h1 className="text-gold font-bold text-sm truncate">O/L Study Tracker</h1>
            <p className="text-text-secondary text-xs">Pro Edition</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm group relative
                ${active
                  ? "bg-gold/15 text-gold"
                  : "text-text-secondary hover:bg-surface-lighter hover:text-text-primary"
                }`}
            >
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gold rounded-r-full"
                />
              )}
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button - desktop only */}
      <div className="p-3 border-t border-gold/10 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-text-secondary hover:text-gold hover:bg-surface-lighter transition-all text-sm"
        >
          {collapsed ? "→" : "← Collapse"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-gold"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="lg:hidden fixed left-0 top-0 h-full w-[260px] bg-surface z-50 border-r border-gold/10"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", damping: 25 }}
        className="hidden lg:block fixed left-0 top-0 h-full bg-surface border-r border-gold/10 z-30"
      >
        <SidebarContent />
      </motion.aside>

      {/* Spacer */}
      <motion.div
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", damping: 25 }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
}
