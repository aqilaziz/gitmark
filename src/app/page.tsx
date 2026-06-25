"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRepos } from "@/hooks/useRepos";
import { useCategories } from "@/hooks/useCategories";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import ViewToggle from "@/components/ViewToggle";
import RepoGrid from "@/components/RepoGrid";
import RepoList from "@/components/RepoList";
import EmptyState from "@/components/EmptyState";
import { ViewMode } from "@/types";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gitmark-view-mode") as ViewMode;
      return saved || "grid";
    }
    return "grid";
  });

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth, router]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("gitmark-view-mode", mode);
  };

  const queryParams = {
    search: search || undefined,
    category: selectedCategory || undefined,
    favorite: showFavorites || undefined,
  };

  const { data: repos = [], isLoading: reposLoading } = useRepos(queryParams);
  const { data: categories = [] } = useCategories();

  const handleSelectCategory = useCallback((name: string | null) => {
    setSelectedCategory(name);
    setShowFavorites(false);
  }, []);

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites((prev) => !prev);
    setSelectedCategory(null);
  }, []);

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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Selamat datang, {user?.user_metadata?.user_name || user?.email} 👋
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola koleksi repository GitHub kamu
            </p>
          </div>

          {/* Search & View Toggle */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <ViewToggle mode={viewMode} onChange={handleViewModeChange} />
          </div>

          {/* Content */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              showFavorites={showFavorites}
              onToggleFavorites={handleToggleFavorites}
            />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {reposLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : repos.length === 0 ? (
                <EmptyState
                  type={
                    search ? "search" : selectedCategory ? "category" : "repos"
                  }
                />
              ) : viewMode === "grid" ? (
                <RepoGrid repos={repos} />
              ) : (
                <RepoList repos={repos} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
