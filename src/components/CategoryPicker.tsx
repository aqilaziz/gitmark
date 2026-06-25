"use client";

import { useState } from "react";
import { useCategories, useCreateCategory } from "@/hooks/useCategories";
import CategoryBadge from "./CategoryBadge";
import { Plus } from "lucide-react";

interface CategoryPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategoryPicker({
  selectedIds,
  onChange,
}: CategoryPickerProps) {
  const { data: categories = [] } = useCategories();
  const createCategory = useCreateCategory();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  const toggleCategory = (catId: string) => {
    if (selectedIds.includes(catId)) {
      onChange(selectedIds.filter((id) => id !== catId));
    } else {
      onChange([...selectedIds, catId]);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const result = await createCategory.mutateAsync({ name: newName.trim() });
      onChange([...selectedIds, result.id]);
      setNewName("");
      setShowNew(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Kategori
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <CategoryBadge
            key={cat.id}
            category={cat}
            selected={selectedIds.includes(cat.id)}
            onClick={() => toggleCategory(cat.id)}
            size="md"
          />
        ))}
        {!showNew && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-3 py-1 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Baru
          </button>
        )}
      </div>
      {showNew && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nama kategori baru..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={createCategory.isPending}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createCategory.isPending ? "..." : "Tambah"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNew(false);
              setNewName("");
            }}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
