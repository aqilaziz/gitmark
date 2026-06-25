"use client";

import { Category } from "@/types";
import { useDeleteCategory } from "@/hooks/useCategories";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (name: string | null) => void;
  showFavorites: boolean;
  onToggleFavorites: () => void;
  repoCounts?: Record<string, number>;
}

export default function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  showFavorites,
  onToggleFavorites,
  repoCounts = {},
}: SidebarProps) {
  const deleteCategory = useDeleteCategory();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      deleteCategory.mutate(id);
    }
  };

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="space-y-1">
        {/* All repos */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            !selectedCategory && !showFavorites
              ? "bg-indigo-50 text-indigo-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          <span className="flex items-center gap-2">
            📂 <span>Semua Repository</span>
          </span>
          <span className="text-xs text-gray-400">
            {Object.values(repoCounts).reduce((a, b) => a + b, 0) || ""}
          </span>
        </button>

        {/* Favorites */}
        <button
          onClick={onToggleFavorites}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            showFavorites
              ? "bg-indigo-50 text-indigo-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          <span className="flex items-center gap-2">
            ⭐ <span>Favorit</span>
          </span>
        </button>

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        {/* Categories */}
        <div className="px-3 py-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Kategori
          </span>
        </div>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative group"
            onMouseEnter={() => setHoveredCat(cat.id)}
            onMouseLeave={() => setHoveredCat(null)}
          >
            <button
              onClick={() => onSelectCategory(cat.name)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                selectedCategory === cat.name
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <span className="flex items-center gap-2">
                <span>{cat.icon || "📁"}</span>
                <span>{cat.name}</span>
              </span>
              <div className="flex items-center gap-1">
                {repoCounts[cat.name] !== undefined && (
                  <span className="text-xs text-gray-400">
                    {repoCounts[cat.name]}
                  </span>
                )}
                {hoveredCat === cat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(cat.id, cat.name);
                    }}
                    className="rounded p-0.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </button>
          </div>
        ))}

        {categories.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-400">Belum ada kategori</p>
        )}
      </div>
    </aside>
  );
}
