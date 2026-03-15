"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin", label: "Pilotage" },
    { href: "/admin/questions", label: "Questions" },
    { href: "/admin/utilisateurs", label: "Utilisateurs" },
    { href: "/admin/historique", label: "Historique (Logs)" },
    { href: "/admin/import", label: "Import de masse (CSV)" },
  ];

  return (
    <div className="mb-8 flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-bold transition-all ${
              isActive
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}