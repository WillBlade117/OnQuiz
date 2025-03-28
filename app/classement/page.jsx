"use client";
import { useState, useEffect } from "react";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [theme, setTheme] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`/api/leaderboard${theme ? `?theme=${theme}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
      })
      .catch((err) => console.error("Erreur lors du chargement du classement:", err));
  }, [theme]);

  const sortedScores = scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  const scoresPerPage = 10;
  const totalPages = Math.ceil(sortedScores.length / scoresPerPage);
  const paginatedScores = sortedScores.slice((page - 1) * scoresPerPage, page * scoresPerPage);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Classement</h2>
      
      <select
        className="w-60 px-4 py-2 bg-blue-500 text-white rounded-lg shadow text-center"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="">Tous les thèmes</option>
        {[
          "Culture", "Histoire", "Science", "Geographie", "Cinema",
          "Sport", "Musique", "Jeux-Video", "Informatique", "Mythologie"
        ].map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nom</th>
              <th className="px-4 py-2 border">Thème</th>
              <th className="px-4 py-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {paginatedScores.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center px-4 py-2">Aucun score enregistré.</td>
              </tr>
            ) : (
              paginatedScores.map((score, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border">{score.player}</td>
                  <td className="px-4 py-2 border">{score.theme}</td>
                  <td className="px-4 py-2 border">{score.score} points</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-20"
        >
          Précédent
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-20"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
