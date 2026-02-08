'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  id?: number;
  question: string;
  answers: Answer[];
}

export default function QuizPage() {
  const params = useParams();
  const theme = params?.theme as string;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [player, setPlayer] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!theme) return;

    setLoading(true);
    fetch(`/api/questions?theme=${encodeURIComponent(theme)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur réseau");
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setLoading(false);
      });
  }, [theme]);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((prev) => prev + 1);

    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleFinishQuiz = async () => {
    if (!player.trim()) return alert("Entrez votre pseudo !");
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, score, theme }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      alert("Score enregistré avec succès !");
      router.push("/classement");
    } catch (error) {
      alert("Erreur lors de la sauvegarde du score.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-slate-500 animate-pulse font-medium">Récupération des questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-slate-500 mb-6">Aucune question trouvée pour le thème "{theme}".</p>
        <Link href="/" className="rounded-xl bg-slate-900 px-6 py-3 text-white font-bold">Retour à l'accueil</Link>
      </div>
    );
  }

  const progress = quizCompleted ? 100 : ((current + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Thème : {theme}</span>
            <span>{current + 1} / {questions.length}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!quizCompleted ? (
            <div className="space-y-8">
              <h2 className="text-center text-2xl font-black leading-tight text-slate-800 md:text-3xl italic">
                "{questions[current].question}"
              </h2>

              <div className="grid gap-3">
                {questions[current].answers.map((ans, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(ans.correct)}
                    className="group flex w-full items-center rounded-xl border-2 border-slate-100 bg-white p-4 text-left font-semibold text-slate-600 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98]"
                  >
                    <span className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold group-hover:bg-indigo-200">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {ans.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-inner">🏆</div>
              <div>
                <h2 className="text-3xl font-black text-slate-900">Bien joué !</h2>
                <p className="mt-2 text-lg text-slate-600 font-medium">
                  Score final : <span className="text-indigo-600 text-3xl">{score}</span> / {questions.length}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3 rounded-2xl bg-slate-50 p-6 border border-slate-200">
                <input
                  type="text"
                  placeholder="Ton pseudo..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                />
                <button
                  onClick={handleFinishQuiz}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Envoi en cours..." : "Enregistrer mon score"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}