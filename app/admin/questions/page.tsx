import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import AdminNav from "./../components/AdminNav";
import QuestionActions from "../components/QuestionActions";
import { THEMES } from "../../../lib/constants";

export default async function AdminDashboard(
  props: { searchParams: Promise<{ page?: string; limit?: string; search?: string; theme?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  const currentPage = parseInt(searchParams.page || "1", 10);
  const limitParam = searchParams.limit || "25";
  const searchQuery = searchParams.search || "";
  const themeQuery = searchParams.theme || "all";
  
  const limit = limitParam === "all" ? 100000 : parseInt(limitParam, 10);
  const offset = (currentPage - 1) * limit;

  let whereClauses = [];
  let queryParams: any[] = [];

  if (searchQuery) {
    whereClauses.push("question LIKE ?");
    queryParams.push(`%${searchQuery}%`);
  }

  if (themeQuery && themeQuery !== "all") {
    whereClauses.push("theme = ?");
    queryParams.push(themeQuery);
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  let questions: RowDataPacket[] = [];
  let totalItems = 0;
  let errorMessage = null;

  try {
    const [countResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(id) as total FROM questions ${whereString}`,
      queryParams
    );
    totalItems = countResult[0].total;

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, theme, question FROM questions ${whereString} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
      queryParams
    );
    questions = rows;
  } catch (error: any) {
    console.error("Erreur SQL Admin:", error);
    errorMessage = error.message;
  }

  const totalPages = limitParam === "all" ? 1 : Math.ceil(totalItems / limit);

  const buildUrl = (page: number, limitVal: string) => {
    let url = `/admin/questions?page=${page}&limit=${limitVal}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (themeQuery !== "all") url += `&theme=${encodeURIComponent(themeQuery)}`;
    return url;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel Administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gérez la base de données de OnQuiz. ({totalItems} questions trouvées)
          </p>
        </div>
        <Link 
          href="/admin/nouvelle-question" 
          className="inline-flex justify-center rounded-lg bg-indigo-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 active:scale-95"
        >
          + Nouvelle Question
        </Link>
      </div>

      <AdminNav />

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <p className="font-bold">Erreur de base de données :</p>
          <p className="font-mono text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* --- BARRE DE RECHERCHE & FILTRES --- */}
      <form method="GET" className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <input type="hidden" name="limit" value={limitParam} />
        
        <div className="flex-1">
          <label htmlFor="search" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">
            Rechercher un mot-clé
          </label>
          <input
            type="text"
            id="search"
            name="search"
            defaultValue={searchQuery}
            placeholder="Ex: Napoléon, Molière, Poudlard..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
          />
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="theme" className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">
            Filtrer par Thème
          </label>
          <select
            id="theme"
            name="theme"
            defaultValue={themeQuery}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-400"
          >
            <option value="all">Tous les thèmes</option>
            {THEMES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.icon} {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Filtrer
          </button>
          
          {(searchQuery || themeQuery !== "all") && (
            <Link
              href={`/admin/questions?limit=${limitParam}`}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-red-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400"
              title="Réinitialiser"
            >
              ✕
            </Link>
          )}
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500 dark:text-slate-400">Afficher :</span>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {["25", "50", "100", "all"].map((val) => (
              <Link
                key={val}
                href={buildUrl(1, val)}
                className={`px-3 py-1.5 transition-colors border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                  limitParam === val 
                    ? "bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-500/20 dark:text-indigo-400" 
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                {val === "all" ? "Tout" : val}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">ID</th>
                <th scope="col" className="px-6 py-4 font-bold">Thème</th>
                <th scope="col" className="px-6 py-4 font-bold">Question</th>
                <th scope="col" className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {questions.length === 0 && !errorMessage ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Aucune question trouvée avec ces filtres.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">#{q.id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                        {q.theme}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-md truncate" title={q.question}>
                      {q.question}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <QuestionActions id={q.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> sur {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <Link
                href={buildUrl(currentPage - 1, limitParam)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              >
                Précédent
              </Link>
            ) : (
              <button disabled className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-800/50">
                Précédent
              </button>
            )}

            {currentPage < totalPages ? (
              <Link
                href={buildUrl(currentPage + 1, limitParam)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              >
                Suivant
              </Link>
            ) : (
              <button disabled className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-400 opacity-50 dark:border-slate-800 dark:bg-slate-800/50">
                Suivant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}