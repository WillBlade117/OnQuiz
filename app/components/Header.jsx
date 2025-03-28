import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link href="/">
        <span className="text-2xl font-bold text-blue-500 cursor-pointer">OnQuiz</span>
      </Link>
      <Link href="/classement">
        <span className="text-lg text-gray-700 hover:text-blue-500 cursor-pointer">Classement</span>
      </Link>
    </header>
  );
}