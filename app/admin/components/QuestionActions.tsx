"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuestionActions({ id }: { id: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer cette question définitivement ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      router.refresh();
    } catch (error) {
      alert("Impossible de supprimer la question.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-3">
      <Link 
        href={`/admin/editer-question/${id}`}
        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
      >
        Éditer
      </Link>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium disabled:opacity-50"
      >
        {isDeleting ? "Suppression..." : "Supprimer"}
      </button>
    </div>
  );
}