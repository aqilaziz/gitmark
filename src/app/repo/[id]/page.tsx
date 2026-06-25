"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRepo } from "@/hooks/useRepos";
import Navbar from "@/components/Navbar";
import RepoForm from "@/components/RepoForm";
import { Loader2, ArrowLeft, ExternalLink, Star, Globe } from "lucide-react";
import Link from "next/link";

export default function RepoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const { data: repo, isLoading: repoLoading } = useRepo(id);

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

  if (loading || repoLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Repository tidak ditemukan
            </h2>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </div>

          {/* GitHub Info Card */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {repo.avatar_url ? (
                <img
                  src={repo.avatar_url}
                  alt={repo.name}
                  className="h-14 w-14 rounded-full"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900">
                  {repo.custom_title || repo.name}
                </h1>
                {repo.custom_title && (
                  <p className="text-sm text-gray-500">{repo.name}</p>
                )}
                {repo.gh_description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {repo.gh_description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  {repo.stars !== null && repo.stars > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {repo.stars.toLocaleString()} stars
                    </span>
                  )}
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {repo.language}
                    </span>
                  )}
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka di GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Edit Repository
            </h2>
            <RepoForm mode="edit" initialData={repo} />
          </div>
        </div>
      </main>
    </div>
  );
}
