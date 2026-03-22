"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [existingThemes, setExistingThemes] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    fetch("/api/themes")
      .then(res => res.json())
      .then(data => Array.isArray(data) && setExistingThemes(data));

    fetch(`/api/admin/questions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Question introuvable");
        return res.json();
      })
      .then(data => {
        setTheme(data.theme);
        setQuestion(data.question);
        
        const parsedAnswers = typeof data.answers === "string" ? JSON.parse(data.answers) : data.answers;
        const answerTexts = parsedAnswers.map((a: any) => a.text);
        const correctIdx = parsedAnswers.findIndex((a: any) => a.correct === true);
        
        setAnswers(answerTexts);
        setCorrectIndex(correctIdx !== -1 ? correctIdx : 0);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!theme.trim() || !question.trim() || answers.some(a => !a.trim())) {
      return setError("Veuillez remplir tous les champs.");
    }

    setIsSubmitting(true);
    const formattedAnswers = answers.map((text, index) => ({
      text,
      correct: index === correctIndex,
    }));

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, question, answers: formattedAnswers }),
      });

      if (!res.ok) throw new Error("Erreur lors de la modification");

      router.push("/admin/questions");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Chargement de la question...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/questions" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
        >
          ←
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Éditer la question</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Modification de la question #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-8">
        
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Thème</label>
            <input
              type="text"
              list="themes-list"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <datalist id="themes-list">
              {existingThemes.map((t, index) => <option key={index} value={t} />)}
            </datalist>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">La Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white resize-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-4 block text-sm font-bold text-slate-700 dark:text-slate-300">
            Les Réponses (cochez la bonne)
          </label>
          <div className="grid gap-3">
            {answers.map((ans, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-colors ${
                  correctIndex === index 
                    ? "border-green-500 bg-green-50 dark:border-green-500/50 dark:bg-green-900/20" 
                    : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctIndex === index}
                  onChange={() => setCorrectIndex(index)}
                  className="h-5 w-5 cursor-pointer accent-green-600"
                />
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  value={ans}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="flex-1 bg-transparent p-2 font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSubmitting ? "Enregistrement..." : "Mettre à jour la question"}
          </button>
        </div>
      </form>
    </div>
  );
}