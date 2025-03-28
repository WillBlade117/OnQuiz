'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Quiz() {
    const { theme } = useParams();
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [score, setScore] = useState(0);
    const [player, setPlayer] = useState("");
    const [quizCompleted, setQuizCompleted] = useState(false);

    useEffect(() => {
        if (theme) {
            fetch(`/api/questions?theme=${encodeURIComponent(theme)}`)
                .then((res) => res.json())
                .then((data) => setQuestions(data))
                .catch((err) => console.error("Erreur lors du chargement des questions:", err));
        }
    }, [theme]);

    const handleAnswer = (correct) => {
        if (correct) setScore(score + 1);
        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleFinishQuiz = async () => {
        if (!player) return alert("Entrez votre pseudo avant de valider votre score !");
        
        const response = await fetch("/api/scores", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player, score, theme }),
        });

        const data = await response.json();
        if (data.error) {
            alert(`Erreur: ${data.error}`);
        } else {
            alert("Score enregistré !");
            router.push("/");
        }
    };

    if (questions.length === 0) return <p>Chargement...</p>;

    const progress = quizCompleted ? 100 : (current / questions.length) * 100;

    return (
        <div className="p-4">
            <div className="relative pt-2 mb-4">
                <div className="flex justify-between mb-2 text-sm">
                    <span>Progression : {Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-300 rounded-full">
                    <div
                        className={`h-2 rounded-full ${progress === 100 ? "bg-gold-500" : "bg-blue-500"}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
            {!quizCompleted ? (
                <>
                    <h2 className="text-xl font-bold">{questions[current].question}</h2>
                    <div className="mt-4 grid gap-2">
                        {questions[current].answers.map((ans, index) => (
                            <button
                                key={index}
                                className="px-4 py-2 bg-gray-200 rounded-lg"
                                onClick={() => handleAnswer(ans.correct)}
                            >
                                {ans.text}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div>
                    <h2 className="text-xl font-bold">Quiz terminé !</h2>
                    <p>Votre score : {score}/{questions.length}</p>
                    <div className="mt-4">
                        <input
                            type="text"
                            placeholder="Votre pseudo"
                            className="border p-2"
                            value={player}
                            onChange={(e) => setPlayer(e.target.value)}
                        />
                        <button 
                            onClick={handleFinishQuiz} 
                            className="ml-2 px-4 py-2 bg-green-500 text-white"
                        >
                            Enregistrer mon score
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
