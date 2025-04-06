import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/">
        <span className="text-2xl font-bold text-blue-500 cursor-pointer">OnQuiz</span>
      </Link>
      <Link href="/classement">
        <span className="border border-gray-700 rounded-md text-lg text-gray-700 shadow-md hover:border-blue-500 hover:text-blue-500 cursor-pointer px-2 py-1">Classement</span>
      </Link>
    </header>
  );
}