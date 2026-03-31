"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({
  initialCost,
  initialSuddenDeathCost = 20,
}: {
  initialCost: number;
  initialSuddenDeathCost?: number;
}) {
  const [cost, setCost] = useState(initialCost);
  const [suddenDeathCost, setSuddenDeathCost] = useState(
    initialSuddenDeathCost,
  );
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
        body: JSON.stringify({
          game_cost: cost,
          sudden_death_cost: suddenDeathCost,
        }),
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
      <h2 className="mb-6 text-xl font-bold text-slate-800 dark:text-white">
        Économie du Jeu
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bloc Partie Classique */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700/50">
            <label
              htmlFor="gameCost"
              className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              Coût Partie Classique
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪙</span>
              <input
                type="number"
                id="gameCost"
                min="0"
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xl font-black text-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
              />
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Après épuisement des 3 gratuites.
            </p>
          </div>

          {/* Bloc Mort Subite */}
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
            <label
              htmlFor="suddenDeathCost"
              className="mb-2 block text-sm font-bold text-red-900 dark:text-red-400"
            >
              Coût Mort Subite 💀
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪙</span>
              <input
                type="number"
                id="suddenDeathCost"
                min="0"
                value={suddenDeathCost}
                onChange={(e) =>
                  setSuddenDeathCost(parseInt(e.target.value) || 0)
                }
                className="w-full rounded-xl border border-red-300 bg-white px-4 py-2 text-xl font-black text-red-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-800 dark:bg-slate-900 dark:text-red-400"
              />
            </div>
            <p className="mt-2 text-xs font-medium text-red-700/70 dark:text-red-400/70">
              Après l'essai gratuit du jour.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
          <button
            type="submit"
            disabled={
              isLoading ||
              (cost === initialCost &&
                suddenDeathCost === initialSuddenDeathCost)
            }
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
