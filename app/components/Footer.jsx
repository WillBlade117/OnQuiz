import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-4 shadow-md text-center">
      <div className="container mx-auto px-4">
        <Link
          href="https://www.william-sart.fr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-lg font-bold">
            William SART
          </span>
        </Link>
        <p className="text-sm">
          Copyright © 2025 - Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
