"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Answer {
  text: string;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

const TIME_LIMIT = 15;
const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MortSubitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<
    "loading" | "playing" | "gameover" | "payment"
  >("loading");

  const [userAnswers, setUserAnswers] = useState<
    { questionId: number; answerIndex: number }[]
  >([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const [gameCost, setGameCost] = useState(20);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      startNewGame();
    }
  }, [status, router]);

  // GESTION DU CHRONO
  useEffect(() => {
    if (gameState !== "playing" || isChecking || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleGameOver();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, isChecking, questions.length]);

  const startNewGame = async (pay = false) => {
    setGameState("loading");
    setScore(0);
    setCurrentIndex(0);
    setUserAnswers([]);
    setSelectedAnswerIndex(null);
    setPaymentError("");
    setTimeLeft(TIME_LIMIT);

    try {
      const url = `/api/questions?theme=mort-subite${pay ? "&pay=true" : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "REQUIRES_PAYMENT") {
          setGameCost(data.cost);
          setGameState("payment");
          return;
        }
        if (data.code === "INSUFFICIENT_CREDITS") {
          setGameCost(data.cost);
          setPaymentError("Vous n'avez pas assez de crédits pour jouer.");
          setGameState("payment");
          return;
        }
        throw new Error(data.error || "Erreur lors du chargement");
      }

      setQuestions(data);
      setGameState("playing");
    } catch (error) {
      console.error(error);
      router.push("/");
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (isChecking) return;
    setIsChecking(true);
    setSelectedAnswerIndex(answerIndex);

    try {
      // 1. On interroge la route serveur pour la validation
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          answerIndex,
        }),
      });
      const data = await res.json();

      // 2. On mémorise la réponse pour l'enregistrement du score final
      const newAnswers = [
        ...userAnswers,
        { questionId: questions[currentIndex].id, answerIndex },
      ];
      setUserAnswers(newAnswers);

      if (data.isCorrect) {
        setScore((s) => s + 1);
        setTimeout(() => {
          setSelectedAnswerIndex(null);
          setIsChecking(false);

          if (currentIndex === questions.length - 1) {
            loadMoreQuestions();
          } else {
            setCurrentIndex((i) => i + 1);
            setTimeLeft(TIME_LIMIT);
          }
        }, 600);
      } else {
        setTimeout(() => {
          handleGameOver(newAnswers);
        }, 800);
      }
    } catch (error) {
      console.error("Erreur de validation", error);
      setIsChecking(false);
    }
  };

  const handleGameOver = async (finalAnswers = userAnswers) => {
    setGameState("gameover");
    setIsChecking(false);

    // 3. On sauvegarde le score, ce qui déduit la partie gratuite
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: session?.user?.name || "Joueur",
          theme: "mort-subite",
          answers: finalAnswers,
        }),
      });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du score", err);
    }
  };

  const loadMoreQuestions = async () => {
    try {
      const res = await fetch(
        "/api/questions?theme=mort-subite&pay=false&continue=true",
      );
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
        setCurrentIndex(0);
        setTimeLeft(TIME_LIMIT);
      } else {
        handleGameOver();
      }
    } catch (error) {
      handleGameOver();
    }
  };

  if (gameState === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600 dark:border-red-900 dark:border-t-red-400"></div>
          <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">
            Préparation de l'arène...
          </p>
        </div>
      </div>
    );
  }

  if (gameState === "payment") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-900/30">
            💀
          </div>
          <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
            Quota gratuit épuisé
          </h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            Vous avez déjà utilisé votre essai gratuit du jour pour le mode Mort
            Subite.
          </p>

          {paymentError ? (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {paymentError}
            </div>
          ) : (
            <button
              onClick={() => startNewGame(true)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
            >
              Jouer pour {gameCost} 🪙
            </button>
          )}

          <Link
            href="/"
            className="text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (gameState === "gameover") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 animate-in zoom-in duration-300">
        <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center shadow-2xl shadow-red-900/20">
          <h2 className="mb-2 text-4xl font-black text-red-500">GAME OVER</h2>
          <p className="mb-6 text-lg font-medium text-slate-400">
            Une erreur et c'est la fin !
          </p>

          <div className="mb-8 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
            <span className="block text-sm font-bold uppercase tracking-widest text-slate-400">
              Série survécue
            </span>
            <span className="text-6xl font-black text-white">
              {score} <span className="text-2xl">🔥</span>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startNewGame(false)}
              className="rounded-xl bg-red-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95"
            >
              Rejouer
            </button>
            <Link
              href="/"
              className="rounded-xl bg-white/10 py-4 font-bold text-white transition-all hover:bg-white/20 active:scale-95"
            >
              Quitter l'arène
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const strokeDashoffset =
    CIRCUMFERENCE - (timeLeft / TIME_LIMIT) * CIRCUMFERENCE;
  const isTimeWarning = timeLeft <= 5;
  const question = questions[currentIndex];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12 transition-colors duration-300">
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 relative">
        <div className="bg-red-50 dark:bg-red-900/10 px-6 py-4 border-b border-red-100 dark:border-red-900/30">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-2">
                <span>💀</span> Mort Subite
              </div>
              <div className="mt-1 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Série :{" "}
                <span className="text-slate-800 dark:text-white font-black text-sm">
                  {score} 🔥
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center h-12 w-12 shrink-0">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                <circle
                  cx="24"
                  cy="24"
                  r={RADIUS}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-slate-200 dark:text-slate-700"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={RADIUS}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-1000 ease-linear ${isTimeWarning ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-orange-500"}`}
                />
              </svg>
              <span
                className={`absolute text-sm font-black transition-colors ${isTimeWarning ? "text-red-500 animate-pulse scale-110" : "text-slate-700 dark:text-slate-200"}`}
              >
                {timeLeft}
              </span>
            </div>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div
            key={currentIndex}
            className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500"
          >
            <h2 className="text-center text-2xl font-black leading-tight text-slate-800 dark:text-white md:text-3xl italic">
              "{question?.question}"
            </h2>
            <div className="grid gap-3">
              {question?.answers.map((ans, index) => {
                const isSelected = selectedAnswerIndex === index;
                const isLocked = isChecking;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={isLocked}
                    className={`group flex w-full items-center rounded-xl border-2 p-4 text-left font-semibold transition-all duration-200
                      ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-500/20 scale-[0.98] dark:border-orange-400 dark:bg-orange-900/40 dark:text-orange-300"
                          : isLocked
                            ? "border-slate-100 bg-white/50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-600 opacity-70"
                            : "border-slate-100 bg-white text-slate-600 hover:border-orange-300 hover:bg-orange-50/50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500/50 dark:hover:bg-orange-900/20 active:scale-[0.98]"
                      }`}
                  >
                    <span
                      className={`mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors
                      ${isSelected ? "bg-orange-500 text-white dark:bg-orange-500" : "bg-slate-100 text-slate-500 group-hover:bg-orange-100 group-hover:text-orange-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-orange-900/50 dark:group-hover:text-orange-300"}`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {ans.text}
                    {isSelected && isChecking && (
                      <span className="ml-auto h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
