import Link from "next/link";

const themes = ["Culture", "Histoire", "Science", "Geographie", "Cinema", "Sport", "Musique", "Jeux-Video", "Informatique", "Mythologie"];

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold">Bienvenue sur OnQuiz</h1>
      <p className="mt-2">Choisissez un thème pour commencer :</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <Link key={theme} href={`/quiz/${theme.toLowerCase()}`}>
            <button className="w-40 px-4 py-2 bg-blue-500 text-white rounded-lg shadow text-center">
              {theme}
            </button>
          </Link>
        ))}
      </div>
    </main>
  );
}