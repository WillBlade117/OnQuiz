export interface Theme {
  name: string;
  icon: string;
  color: string;
}

export const THEMES: Theme[] = [
  { name: "Culture", icon: "🧠", color: "from-blue-500 to-cyan-400" },
  { name: "Histoire", icon: "📜", color: "from-amber-500 to-orange-400" },
  { name: "Science", icon: "🧪", color: "from-emerald-500 to-green-400" },
  { name: "Geographie", icon: "🌍", color: "from-sky-500 to-indigo-400" },
  { name: "Cinema", icon: "🎬", color: "from-purple-600 to-pink-500" },
  { name: "Sport", icon: "⚽", color: "from-red-500 to-orange-500" },
  { name: "Musique", icon: "🎵", color: "from-rose-500 to-pink-400" },
  { name: "Jeux-Video", icon: "🎮", color: "from-indigo-600 to-blue-500" },
  { name: "Informatique", icon: "💻", color: "from-slate-700 to-slate-900" },
  { name: "Mythologie", icon: "🔱", color: "from-yellow-600 to-amber-500" },
];

export const THEME_NAMES = THEMES.map(theme => theme.name);