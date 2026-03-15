import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import AdminNav from "./../components/AdminNav";
import QuestionActions from "../components/QuestionActions";

export default async function AdminDashboard(
  props: { searchParams: Promise<{ page?: string; limit?: string }> }
) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  const currentPage = parseInt(searchParams.page || "1", 10);
  const limitParam = searchParams.limit || "25";
  
  const limit = limitParam === "all" ? 100000 : parseInt(limitParam, 10);
  const offset = (currentPage - 1) * limit;

  let questions: RowDataPacket[] = [];
  let totalItems = 0;
  let errorMessage = null;

  try {
    const [countResult] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as total FROM questions"
    );
    totalItems = countResult[0].total;

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id, theme, question FROM questions ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
    );
    questions = rows;
  } catch (error: any) {
    console.error("Erreur SQL Admin:", error);
    errorMessage = error.message;
  }

  const totalPages = limitParam === "all" ? 1 : Math.ceil(totalItems / limit);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel Administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gérez la base de données de OnQuiz. ({totalItems} questions au total)
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-500 dark:text-slate-400">Afficher :</span>
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {["25", "50", "100", "all"].map((val) => (
              <Link
                key={val}
                href={`/admin?page=1&limit=${val}`}
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
                    Aucune question sur cette page.
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
                href={`/admin?page=${currentPage - 1}&limit=${limitParam}`}
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
                href={`/admin?page=${currentPage + 1}&limit=${limitParam}`}
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