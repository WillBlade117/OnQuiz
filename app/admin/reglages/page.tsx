import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import AdminNav from "../components/AdminNav";
import SettingsForm from "./components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  let gameCost = 10;
  let suddenDeathCost = 20; // Notre nouvelle valeur par défaut

  try {
    // On récupère les deux réglages d'un coup
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('game_cost', 'sudden_death_cost')",
    );

    rows.forEach((row) => {
      if (row.setting_key === "game_cost")
        gameCost = parseInt(row.setting_value);
      if (row.setting_key === "sudden_death_cost")
        suddenDeathCost = parseInt(row.setting_value);
    });
  } catch (error) {
    console.error("Erreur SQL Réglages:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Réglages
        </h1>
        <p className="text-slate-500 font-medium dark:text-slate-400">
          Configurez les paramètres globaux de l'application.
        </p>
      </div>

      <AdminNav />

      <div className="max-w-xl">
        <SettingsForm
          initialCost={gameCost}
          initialSuddenDeathCost={suddenDeathCost}
        />
      </div>
    </div>
  );
}
