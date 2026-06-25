"use client";

import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  onClick?: () => void;
  onRemove?: () => void;
  selected?: boolean;
  size?: "sm" | "md";
}

export default function CategoryBadge({
  category,
  onClick,
  onRemove,
  selected = false,
  size = "sm",
}: CategoryBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        onClick && "cursor-pointer hover:opacity-80",
        selected
          ? "border-transparent text-white"
          : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
      )}
      style={
        selected ? { backgroundColor: category.color || "#6366f1" } : undefined
      }
    >
      <span>{category.icon || "📁"}</span>
      <span>{category.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 rounded-full hover:bg-black/10 p-0.5"
        >
          ×
        </button>
      )}
    </span>
  );
}
