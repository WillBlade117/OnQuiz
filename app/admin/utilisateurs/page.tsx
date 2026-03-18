import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import AdminNav from "../components/AdminNav";
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

    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT 
        u.id, u.name, u.email, u.image, u.role, u.is_banned, u.created_at, u.credits,
        MAX(s.created_at) as last_played
      FROM users u
      LEFT JOIN scores s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    users = rows;
  } catch (error) {
    console.error("Erreur SQL Utilisateurs:", error);
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return <span className="text-slate-400 italic">Jamais</span>;
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel Administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Gérez les joueurs de OnQuiz. ({totalUsers} inscrits)
          </p>
        </div>
      </div>

      <AdminNav />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Joueur</th>
                <th scope="col" className="px-6 py-4 font-bold">Inscription</th>
                <th scope="col" className="px-6 py-4 font-bold">Dernière Partie</th>
                <th scope="col" className="px-6 py-4 font-bold">Crédits</th>
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
                        <Image
                          src={u.image}
                          alt={u.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">👤</div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {u.name}
                          {u.role === "admin" && (
                            <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">Admin</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 font-medium">{formatDate(u.created_at)}</td>
                  <td className="px-6 py-4 font-medium">{formatDate(u.last_played)}</td>
                  
                  <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400 text-lg">
                    🪙 {u.credits || 0}
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
                    <UserActions 
                      id={u.id} 
                      isBanned={Boolean(u.is_banned)} 
                      role={u.role} 
                      userName={u.name}
                      currentCredits={u.credits || 0}
                    />
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