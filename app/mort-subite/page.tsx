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

export default function MortSubitePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<
    "loading" | "playing" | "gameover" | "payment"
  >("loading");

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [gameCost, setGameCost] = useState(20);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      startNewGame();
    }
  }, [status, router]);

  const startNewGame = async (pay = false) => {
    setGameState("loading");
    setScore(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setPaymentError("");

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

  const handleAnswer = async (answerText: string) => {
    if (isChecking) return;
    setIsChecking(true);
    setSelectedAnswer(answerText);

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          answer: answerText,
          theme: "mort-subite",
          isSuddenDeath: true,
          currentScore: score,
        }),
      });

      const data = await res.json();

      if (data.isCorrect) {
        // Bonne réponse ! On incrémente le score et on passe à la suivante
        setScore((s) => s + 1);
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsChecking(false);

          // Si on arrive à la fin du lot de 10 questions, on en recharge 10 autres en silence
          if (currentIndex === questions.length - 1) {
            loadMoreQuestions();
          } else {
            setCurrentIndex((i) => i + 1);
          }
        }, 1000);
      } else {
        // Mauvaise réponse = GAME OVER immédiat
        setTimeout(() => {
          setGameState("gameover");
          setIsChecking(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur de validation", error);
      setIsChecking(false);
    }
  };

  const loadMoreQuestions = async () => {
    try {
      // On recharge des questions sans repayer (car on est dans la même partie)
      const res = await fetch(
        "/api/questions?theme=mort-subite&pay=false&continue=true",
      );
      const data = await res.json();
      if (res.ok) {
        setQuestions(data);
        setCurrentIndex(0);
      } else {
        // Si l'API refuse de donner la suite, on arrête (sécurité)
        setGameState("gameover");
      }
    } catch (error) {
      setGameState("gameover");
    }
  };

  // ================= ECRANS =================

  if (gameState === "loading") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
        <p className="mt-4 animate-pulse text-lg font-bold text-red-500">
          Préparation de l'arène...
        </p>
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
              Quitter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* En-tête Mort Subite */}
      <div className="mb-8 flex items-center justify-between rounded-2xl bg-red-500/10 p-4 border border-red-500/20">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30">
            💀
          </span>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-red-500">
              Mort Subite
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              1 seule vie
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">
            Série en cours
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {score} 🔥
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-10 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl text-center">
          {question?.question}
        </h2>
      </div>

      {/* Réponses */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {question?.answers.map((answer, index) => {
          let btnClass =
            "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";

          if (isChecking && selectedAnswer === answer.text) {
            // En attente de la validation serveur, on met en surbrillance neutre
            btnClass =
              "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 scale-95 opacity-80 animate-pulse";
          } else if (isChecking) {
            btnClass =
              "opacity-50 cursor-not-allowed bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(answer.text)}
              disabled={isChecking}
              className={`group relative flex min-h-[5rem] items-center justify-center rounded-2xl border-2 p-4 text-center text-lg font-bold transition-all ${btnClass}`}
            >
              {answer.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
