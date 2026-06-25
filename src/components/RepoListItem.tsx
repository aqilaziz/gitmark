"use client";

import Link from "next/link";
import { RepoWithCategories } from "@/types";
import { formatStars, timeAgo } from "@/lib/utils";
import { Star, ExternalLink, Heart, Trash2, Edit } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import { useDeleteRepo, useUpdateRepo } from "@/hooks/useRepos";

interface RepoListItemProps {
  repo: RepoWithCategories;
}

export default function RepoListItem({ repo }: RepoListItemProps) {
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
  };

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-sm hover:border-gray-300">
      {/* Avatar */}
      {repo.avatar_url ? (
        <img
          src={repo.avatar_url}
          alt={repo.name}
          className="h-10 w-10 rounded-full flex-shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">📦</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/repo/${repo.id}`}
            className="font-semibold text-gray-900 hover:text-indigo-600 truncate"
          >
            {repo.custom_title || repo.name}
          </Link>
          {repo.custom_title && (
            <span className="text-sm text-gray-400 hidden sm:inline">
              {repo.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">
          {repo.description || repo.gh_description || "Tidak ada deskripsi"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {repo.stars !== null && repo.stars > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 text-yellow-500" />
              {formatStars(repo.stars)}
            </span>
          )}
          {repo.language && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {repo.language}
            </span>
          )}
          {repo.categories?.map((cat) => (
            <CategoryBadge key={cat.id} category={cat} />
          ))}
          <span className="text-xs text-gray-400">
            {timeAgo(repo.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFavorite}
          className="rounded p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          title={repo.is_favorite ? "Hapus dari favorit" : "Tambah ke favorit"}
        >
          <Heart
            className={`h-4 w-4 ${
              repo.is_favorite ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
        <Link
          href={`/repo/${repo.id}`}
          className="rounded p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Link>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
          title="Buka link"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          onClick={handleDelete}
          className="rounded p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
