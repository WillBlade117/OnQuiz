import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import AdminNav from "../components/AdminNav";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  let logs: RowDataPacket[] = [];

  try {
    const [rows] = await db.execute<RowDataPacket[]>(`
      SELECT 
        l.id, l.action, l.target_id, l.details, l.created_at,
        u.name as actor_name, u.image as actor_image,
        t.name as target_name
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN users t ON l.target_id = t.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `);
    logs = rows;
  } catch (error) {
    console.error("Erreur SQL Historique:", error);
  }

  const formatAction = (action: string) => {
    switch (action) {
      case "USER_REGISTER":
        return { text: "Nouvelle Inscription", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", icon: "👋" };
      case "BAN_USER":
        return { text: "Utilisateur Banni", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", icon: "🛑" };
      case "UNBAN_USER":
        return { text: "Utilisateur Débanni", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", icon: "✅" };
      case "ADD_CREDITS":
        return { text: "Crédits Ajoutés", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400", icon: "🪙" };
      case "UPDATE_CREDITS":
        return { text: "Solde Modifié", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400", icon: "💰" };
      case "IMPORT_QUESTIONS":
        return { text: "Import CSV", color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-400", icon: "📥" };
      default:
        return { text: action, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400", icon: "⚡" };
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel Administrateur</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Historique des événements système.
          </p>
        </div>
      </div>

      <AdminNav />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
        
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 py-10">Aucun événement enregistré pour le moment.</div>
        ) : (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8">
            {logs.map((log) => {
              const actionStyle = formatAction(log.action);
              const date = new Date(log.created_at);
              
              return (
                <div key={log.id} className="relative pl-8">
                  <span className="absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-slate-200 dark:bg-slate-900 dark:border-slate-700 shadow-sm text-sm">
                    {actionStyle.icon}
                  </span>
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wide ${actionStyle.color}`}>
                          {actionStyle.text}
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {date.toLocaleString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {log.actor_name ? (
                          <>
                            {log.actor_image ? (
                              <Image
                                src={log.actor_image}
                                alt={`Avatar de ${log.actor_name || "l'utilisateur"}`}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            )}
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.actor_name}</span>
                          </>
                        ) : (
                          <span className="font-bold text-slate-500 italic">Système</span>
                        )}
                        
                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                          {log.details && `— ${log.details}`}
                          {log.target_name 
                            ? ` (Cible : ${log.target_name})` 
                            : log.target_id 
                              ? ` (Cible ID: ${log.target_id})` 
                              : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}