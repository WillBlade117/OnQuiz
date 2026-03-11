"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserActions({ id, isBanned, role }: { id: number, isBanned: boolean, role: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const toggleBan = async () => {
    const action = isBanned ? "débannir" : "bannir";
    if (!window.confirm(`Voulez-vous vraiment ${action} ce joueur ?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_banned: isBanned ? 0 : 1 }),
      });

      if (!res.ok) throw new Error("Erreur API");
      
      router.refresh();
    } catch (error) {
      alert(`Impossible de ${action} l'utilisateur.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (role === "admin") {
    return <span className="text-xs font-bold text-slate-400">Intouchable</span>;
  }

  return (
    <button
      onClick={toggleBan}
      disabled={isLoading}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
        isBanned
          ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
      }`}
    >
      {isLoading ? "..." : isBanned ? "Débannir" : "Bannir"}
    </button>
  );
}