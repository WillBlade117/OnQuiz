"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminNav from "../components/AdminNav";

interface PreviewQuestion {
  theme: string;
  question: string;
  answers: { text: string; correct: boolean }[];
}

export default function ImportCsvPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewQuestion[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  if (status === "unauthenticated" || (session && session.user?.role !== "admin")) {
    router.push("/");
    return null;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(selectedFile);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n");
    const parsedQuestions: PreviewQuestion[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(";");
      
      if (columns.length < 6) continue;

      const [theme, question, bonneReponse, fausse1, fausse2, fausse3] = columns;

      const allAnswers = [
        { text: bonneReponse.trim(), correct: true },
        { text: fausse1.trim(), correct: false },
        { text: fausse2.trim(), correct: false },
        { text: fausse3.trim(), correct: false },
      ].sort(() => Math.random() - 0.5);

      parsedQuestions.push({
        theme: theme.trim(),
        question: question.trim(),
        answers: allAnswers,
      });
    }

    setPreview(parsedQuestions);
  };

  const importData = async () => {
    if (preview.length === 0) return;
    setIsUploading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: preview }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      setMessage({ text: data.message, type: "success" });
      setPreview([]);
      setFile(null);
      const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Import CSV</h1>
        <p className="text-slate-500 font-medium">Ajoutez plusieurs questions d'un coup via un fichier Excel.</p>
      </div>

      <AdminNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Sélectionner un fichier</h2>
            
            <input 
              type="file" 
              id="csv-upload"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer"
            />

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message.text}
              </div>
            )}

            <button
              onClick={importData}
              disabled={preview.length === 0 || isUploading}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Importation..." : `Importer ${preview.length} questions`}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Format attendu (.csv)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Le fichier doit utiliser le point-virgule (;) comme séparateur. La première ligne est ignorée (en-têtes).
            </p>
            <div className="text-xs bg-slate-200 dark:bg-slate-900 p-3 rounded-lg font-mono text-slate-600 dark:text-slate-300 overflow-x-auto whitespace-nowrap">
              theme;question;bonne;fausse1;fausse2;fausse3<br/>
              Nature;Quel animal?;Loup;Ours;Cerf;Renard
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl h-full">
            <h2 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex justify-between items-center">
              Prévisualisation
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-sm">
                {preview.length} valides
              </span>
            </h2>

            {preview.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                Aucun fichier chargé ou fichier vide.
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {preview.slice(0, 10).map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-indigo-500 mb-1 block">{q.theme}</span>
                    <p className="font-bold text-slate-800 dark:text-white mb-3">{q.question}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {q.answers.map((a, i) => (
                        <div key={i} className={`p-2 rounded-md ${a.correct ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold" : "bg-white dark:bg-slate-800 text-slate-500"}`}>
                          {a.text}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {preview.length > 10 && (
                  <div className="text-center p-4 text-slate-400 font-medium italic">
                    + {preview.length - 10} autres questions masquées...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}