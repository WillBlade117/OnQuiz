"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialCost }: { initialCost: number }) {
  const [cost, setCost] = useState(initialCost);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_cost: cost }),
      });

      if (!res.ok) throw new Error("Erreur");
      
      setMessage("✅ Réglages sauvegardés avec succès !");
      router.refresh();
      
      setTimeout(() => setMessage(""), 3000); 
    } catch (error) {
      setMessage("❌ Erreur lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">Économie du Jeu</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="gameCost" className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
            Coût d'une partie (en crédits)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪙</span>
            <input
              type="number"
              id="gameCost"
              min="0"
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 0)}
              className="w-32 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xl font-black text-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400"
            />
          </div>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            C'est le montant qui sera déduit aux joueurs qui ont épuisé leur quota de parties gratuites quotidiennes.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <button
            type="submit"
            disabled={isLoading || cost === initialCost}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? "Sauvegarde..." : "Enregistrer"}
          </button>
          
          {message && (
            <span className="animate-in fade-in slide-in-from-left-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}