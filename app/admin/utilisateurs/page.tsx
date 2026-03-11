import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import Link from "next/link";
import UserActions from "./components/UserActions";

export default async function UsersDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  let users: RowDataPacket[] = [];
  let totalUsers = 0;

  try {
    const [countResult] = await db.execute<RowDataPacket[]>("SELECT COUNT(id) as total FROM users");
    totalUsers = countResult[0].total;

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, name, email, image, role, is_banned FROM users ORDER BY id DESC"
    );
    users = rows;
  } catch (error) {
    console.error("Erreur SQL Utilisateurs:", error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel Administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gérez les joueurs de OnQuiz. ({totalUsers} inscrits)
          </p>
        </div>
      </div>

      <div className="mb-8 flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
        <Link 
          href="/admin" 
          className="border-b-2 border-transparent px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700 transition-all"
        >
          Questions
        </Link>
        <Link 
          href="/admin/utilisateurs" 
          className="border-b-2 border-indigo-600 px-4 py-2 text-sm font-bold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        >
          Utilisateurs
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Joueur</th>
                <th scope="col" className="px-6 py-4 font-bold">Email</th>
                <th scope="col" className="px-6 py-4 font-bold">Rôle</th>
                <th scope="col" className="px-6 py-4 font-bold">Statut</th>
                <th scope="col" className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.image ? (
                        <img src={u.image} alt={u.name} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">👤</div>
                      )}
                      <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    {u.role === "admin" ? (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">Admin</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">Joueur</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_banned ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                        <span className="h-2 w-2 rounded-full bg-red-600"></span> Banni
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-600"></span> Actif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActions id={u.id} isBanned={Boolean(u.is_banned)} role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}