"use client";

import Link from "next/link";
import { RepoWithCategories } from "@/types";
import { formatStars, truncateText } from "@/lib/utils";
import {
  Star,
  ExternalLink,
  Heart,
  MoreVertical,
  Trash2,
  Edit,
} from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { useState } from "react";
import { useDeleteRepo, useUpdateRepo } from "@/hooks/useRepos";

interface RepoCardProps {
  repo: RepoWithCategories;
}

export default function RepoCard({ repo }: RepoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const deleteRepo = useDeleteRepo();
  const updateRepo = useUpdateRepo();

  const toggleFavorite = () => {
    updateRepo.mutate({
      id: repo.id,
      data: { is_favorite: !repo.is_favorite },
    });
  };

  const handleDelete = () => {
    if (confirm("Yakin ingin menghapus repository ini?")) {
      deleteRepo.mutate(repo.id);
    }
    setShowMenu(false);
  };

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {repo.avatar_url ? (
            <img
              src={repo.avatar_url}
              alt={repo.name}
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">📦</span>
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/repo/${repo.id}`}
              className="block text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate"
            >
              {repo.custom_title || repo.name}
            </Link>
            {repo.custom_title && (
              <p className="text-xs text-gray-500 truncate">{repo.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleFavorite}
            className="rounded p-1 text-gray-400 hover:text-red-500 transition-colors"
            title={
              repo.is_favorite ? "Hapus dari favorit" : "Tambah ke favorit"
            }
          >
            <Heart
              className={`h-4 w-4 ${
                repo.is_favorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <Link
                  href={`/repo/${repo.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowMenu(false)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        {repo.stars !== null && repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            {formatStars(repo.stars)}
          </span>
        )}
        {repo.language && (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {repo.language}
          </span>
        )}
      </div>

      {/* Description */}
      {(repo.description || repo.gh_description) && (
        <p className="mt-2 text-sm text-gray-600">
          {truncateText(repo.description || repo.gh_description || "", 120)}
        </p>
      )}

      {/* Categories */}
      {repo.categories && repo.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {repo.categories.map((cat) => (
            <CategoryBadge key={cat.id} category={cat} />
          ))}
        </div>
      )}

      {/* Link */}
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ExternalLink className="h-3 w-3" />
        Buka link
      </a>
    </div>
  );
}
