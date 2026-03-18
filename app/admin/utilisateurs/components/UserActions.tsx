"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserActions({ 
  id, 
  isBanned, 
  role, 
  userName, 
  currentCredits 
}: { 
  id: number, 
  isBanned: boolean, 
  role: string, 
  userName: string, 
  currentCredits: number 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const addCredits = async () => {
    const input = prompt(`Combien de crédits veux-tu AJOUTER à ${userName} ?`);
    
    if (input === null || input.trim() === "") return;

    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount === 0) {
      alert("Veuillez entrer un nombre valide.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_credits", amount: amount }),
      });

      if (!res.ok) throw new Error("Erreur API");
      router.refresh();
    } catch (error) {
      alert("Impossible d'ajouter les crédits.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBan = async () => {
    const action = isBanned ? "débannir" : "bannir";
    if (!window.confirm(`Voulez-vous vraiment ${action} ${userName} ?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_ban", is_banned: isBanned ? 0 : 1 }),
      });

      if (!res.ok) throw new Error("Erreur API");
      router.refresh();
    } catch (error) {
      alert(`Impossible de ${action} l'utilisateur.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      <button
        onClick={addCredits}
        disabled={isLoading}
        className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 disabled:opacity-50"
      >
        <span>➕</span> Crédits
      </button>

      {role === "admin" ? (
        <span className="text-xs font-bold text-slate-400 italic w-[70px] text-center">Intouchable</span>
      ) : (
        <button
          onClick={toggleBan}
          disabled={isLoading}
          className={`w-[70px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 text-center ${
            isBanned
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
          }`}
        >
          {isLoading ? "..." : isBanned ? "Débannir" : "Bannir"}
        </button>
      )}
    </div>
  );
}