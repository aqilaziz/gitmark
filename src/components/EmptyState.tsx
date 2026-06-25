"use client";

import { Bookmark, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  type?: "repos" | "search" | "category";
  title?: string;
  description?: string;
}

export default function EmptyState({
  type = "repos",
  title,
  description,
}: EmptyStateProps) {
  const defaults = {
    repos: {
      title: "Belum ada repository",
      description:
        "Mulai simpan repository GitHub favoritmu dengan menekan tombol di bawah.",
    },
    search: {
      title: "Tidak ditemukan",
      description: "Coba gunakan kata kunci yang berbeda.",
    },
    category: {
      title: "Kategori kosong",
      description: "Belum ada repository dalam kategori ini.",
    },
  };

  const finalTitle = title || defaults[type].title;
  const finalDescription = description || defaults[type].description;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-indigo-50 p-4">
        <Bookmark className="h-8 w-8 text-indigo-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{finalTitle}</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{finalDescription}</p>
      {type === "repos" && (
        <Link
          href="/add"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Repository
        </Link>
      )}
    </div>
  );
}
