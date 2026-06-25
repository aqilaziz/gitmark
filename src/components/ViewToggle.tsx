"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode } from "@/types";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "grid"
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "list"
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-500 hover:text-gray-700",
        )}
      >
        <List className="h-4 w-4" />
        List
      </button>
    </div>
  );
}
