"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { parseGitHubUrl } from "@/lib/utils";
import { useCreateRepo, useUpdateRepo } from "@/hooks/useRepos";
import CategoryPicker from "./CategoryPicker";
import { RepoWithCategories, GitHubMetadata } from "@/types";
import { Loader2, Star, Globe } from "lucide-react";

interface RepoFormProps {
  mode: "create" | "edit";
  initialData?: RepoWithCategories;
  onSuccess?: () => void;
}

export default function RepoForm({
  mode,
  initialData,
  onSuccess,
}: RepoFormProps) {
  const router = useRouter();
  const createRepo = useCreateRepo();
  const updateRepo = useUpdateRepo();

  const [url, setUrl] = useState(initialData?.url || "");
  const [customTitle, setCustomTitle] = useState(
    initialData?.custom_title || "",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [isFavorite, setIsFavorite] = useState(
    initialData?.is_favorite || false,
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c) => c.id) || [],
  );
  const [metadata, setMetadata] = useState<GitHubMetadata | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Auto-fetch metadata when URL changes (create mode only)
  useEffect(() => {
    if (mode !== "create" || !url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMetadata(null);
      return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      if (url.includes("github.com")) {
        setUrlError("Format URL tidak valid. Gunakan: github.com/owner/repo");
      }
      setMetadata(null);
      return;
    }

    setUrlError("");
    const controller = new AbortController();

    const fetchMeta = async () => {
      setFetchingMeta(true);
      try {
        const res = await fetch("/api/github", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setMetadata(data);
        }
      } catch {
        // Ignore abort errors
      } finally {
        setFetchingMeta(false);
      }
    };

    const timeout = setTimeout(fetchMeta, 500);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      if (!url) {
        setUrlError("URL repository wajib diisi");
        return;
      }
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        setUrlError("Format URL tidak valid");
        return;
      }
    }

    try {
      if (mode === "create") {
        await createRepo.mutateAsync({
          url,
          custom_title: customTitle || undefined,
          description: description || undefined,
          category_ids: selectedCategoryIds,
          is_favorite: isFavorite,
        });
        onSuccess?.() || router.push("/");
      } else if (initialData) {
        await updateRepo.mutateAsync({
          id: initialData.id,
          data: {
            custom_title: customTitle || null,
            description: description || null,
            category_ids: selectedCategoryIds,
            is_favorite: isFavorite,
          },
        });
        onSuccess?.() || router.push("/");
        router.refresh();
      }
    } catch {
      // Error handled by mutation
    }
  };

  const isPending =
    mode === "create" ? createRepo.isPending : updateRepo.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL field (create mode only) */}
      {mode === "create" && (
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL Repository GitHub
          </label>
          <div className="relative mt-1">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            {fetchingMeta && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>
          {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}

          {/* Metadata preview */}
          {metadata && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                {metadata.owner.avatar_url && (
                  <img
                    src={metadata.owner.avatar_url}
                    alt={metadata.owner.login}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900">
                    {metadata.full_name}
                  </h4>
                  {metadata.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {metadata.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {metadata.stargazers_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {metadata.stargazers_count.toLocaleString()}
                      </span>
                    )}
                    {metadata.language && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {metadata.language}
                      </span>
                    )}
                    {metadata.topics?.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom title */}
      <div>
        <label
          htmlFor="customTitle"
          className="block text-sm font-medium text-gray-700"
        >
          Judul Kustom{" "}
          <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <input
          type="text"
          id="customTitle"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder={
            metadata?.full_name || initialData?.name || "Nama custom..."
          }
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Deskripsi / Catatan{" "}
          <span className="text-gray-400 font-normal">(opsional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tulis catatan tentang repository ini..."
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Categories */}
      <CategoryPicker
        selectedIds={selectedCategoryIds}
        onChange={setSelectedCategoryIds}
      />

      {/* Favorite toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isFavorite ? "bg-indigo-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isFavorite ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-700">
          {isFavorite ? "⭐ Ditandai sebagai favorit" : "Tambahkan ke favorit"}
        </span>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Simpan Repository" : "Update Repository"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
