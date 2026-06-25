"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useCategories";
import Navbar from "@/components/Navbar";
import { Loader2, Plus, Trash2, Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6b7280", // gray
];

const ICONS = [
  "📁",
  "🔧",
  "📚",
  "🎨",
  "🤖",
  "📱",
  "🌐",
  "⚡",
  "🎮",
  "🧪",
  "📊",
  "🔒",
];

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newIcon, setNewIcon] = useState(ICONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const supabase = createClient();
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setLoading(false);
    };
    getUser();
  }, [supabase.auth, router]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync({
        name: newName.trim(),
        color: newColor,
        icon: newIcon,
      });
      setNewName("");
      setShowForm(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateCategory.mutateAsync({
        id,
        data: { name: editName.trim() },
      });
      setEditingId(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      await deleteCategory.mutateAsync(id);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Kelola Kategori
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Buat dan atur kategori untuk mengorganisasi repository kamu
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Kategori
            </button>
          </div>

          {/* Create Form */}
          {showForm && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">
                Kategori Baru
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama kategori..."
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ikon
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewIcon(icon)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-lg transition-all",
                          newIcon === icon
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300",
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Warna
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColor(color)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all",
                          newColor === color
                            ? "border-gray-900 scale-110"
                            : "border-transparent",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={createCategory.isPending || !newName.trim()}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createCategory.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setNewName("");
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {catsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-12 text-center">
                <p className="text-gray-500">
                  Belum ada kategori. Buat kategori pertamamu!
                </p>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: cat.color + "20" }}
                  >
                    {cat.icon || "📁"}
                  </span>
                  {editingId === cat.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleUpdate(cat.id)
                        }
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(cat.id)}
                        className="rounded p-1 text-green-600 hover:bg-green-50"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <button
                          onClick={() => {
                            setEditingId(cat.id);
                            setEditName(cat.name);
                          }}
                          className="rounded p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
