'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Answer {
  text: string;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export default function QuizPage() {
  const params = useParams();
  const theme = params?.theme as string;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [player, setPlayer] = useState("");
  const [userAnswers, setUserAnswers] = useState<{questionId: number, answerIndex: number}[]>([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedPlayer = localStorage.getItem("onquiz_player");
    if (savedPlayer) {
      setPlayer(savedPlayer);
    }
  }, []);

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

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswerIndex !== null) return;
    
    setSelectedAnswerIndex(answerIndex);

    setUserAnswers((prev) => [
      ...prev, 
      { questionId: questions[current].id, answerIndex }
    ]);

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent((prev) => prev + 1);
        setSelectedAnswerIndex(null);
      } else {
        setQuizCompleted(true);
      }
    }, 600);
  };

  const handleFinishQuiz = async () => {
    if (!player.trim()) return alert("Entrez votre pseudo !");
    
    localStorage.setItem("onquiz_player", player);
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player, theme, answers: userAnswers }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setFinalScore(data.score);
    } catch (error) {
      alert("Erreur lors de la sauvegarde du score.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400"></div>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">Récupération des questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md p-10 text-center transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Aucune question trouvée pour le thème "{theme}".</p>
        <Link href="/" className="inline-block rounded-xl bg-slate-900 dark:bg-white px-6 py-3 text-white dark:text-slate-900 font-bold transition-transform hover:scale-105">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const progress = quizCompleted ? 100 : ((current + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12 transition-colors duration-300">
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
        
        {/* ... Header de la carte ... */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Thème : <span className="text-indigo-600 dark:text-indigo-400">{theme}</span></span>
            <span>{current + 1} / {questions.length}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!quizCompleted ? (
            <div key={current} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-center text-2xl font-black leading-tight text-slate-800 dark:text-white md:text-3xl italic">
                "{questions[current].question}"
              </h2>

              <div className="grid gap-3">
                {questions[current].answers.map((ans, index) => {
                  const isSelected = selectedAnswerIndex === index;
                  const isLocked = selectedAnswerIndex !== null;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={isLocked}
                      className={`group flex w-full items-center rounded-xl border-2 p-4 text-left font-semibold transition-all duration-200
                        ${isSelected 
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/20 scale-[0.98] dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-300" 
                          : isLocked
                            ? "border-slate-100 bg-white/50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-600 opacity-70"
                            : "border-slate-100 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20 active:scale-[0.98]"
                        }
                      `}
                    >
                      <span className={`mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors
                        ${isSelected
                          ? "bg-indigo-500 text-white dark:bg-indigo-500"
                          : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-300"
                        }
                      `}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {ans.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : finalScore === null ? (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-300">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-4xl shadow-inner">🏁</div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Quiz terminé !</h2>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 font-medium">
                  Entre ton pseudo pour découvrir ton score et t'inscrire au classement.
                </p>
              </div>

              <div className="w-full max-w-xs space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Ton pseudo..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-center font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                />
                <button
                  onClick={handleFinishQuiz}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSubmitting ? "Calcul en cours..." : "Découvrir mon score"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in duration-300">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-4xl shadow-inner">🏆</div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Bien joué {player} !</h2>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 font-medium">
                  Ton score final est de : <span className="text-indigo-600 dark:text-indigo-400 text-3xl font-black">{finalScore}</span> / {questions.length}
                </p>
              </div>
              <button
                onClick={() => router.push("/classement")}
                className="w-full max-w-xs rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all active:scale-95"
              >
                Voir le classement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}