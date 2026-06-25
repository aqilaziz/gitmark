"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RepoWithCategories } from "@/types";
import { CreateRepoInput, UpdateRepoInput } from "@/lib/validators";
import { toast } from "sonner";

interface FetchReposParams {
  search?: string;
  category?: string;
  favorite?: boolean;
  page?: number;
  limit?: number;
}

async function fetchRepos(
  params: FetchReposParams = {},
): Promise<RepoWithCategories[]> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.category) searchParams.set("category", params.category);
  if (params.favorite) searchParams.set("favorite", "true");
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(`/api/repos?${searchParams.toString()}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Gagal mengambil data repository");
  }
  return response.json();
}

async function fetchRepo(id: string): Promise<RepoWithCategories> {
  const response = await fetch(`/api/repos/${id}`);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Gagal mengambil detail repository");
  }
  return response.json();
}

async function createRepo(data: CreateRepoInput): Promise<RepoWithCategories> {
  const response = await fetch("/api/repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Gagal menambahkan repository");
  }
  return response.json();
}

async function updateRepo(
  id: string,
  data: UpdateRepoInput,
): Promise<RepoWithCategories> {
  const response = await fetch(`/api/repos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Gagal mengupdate repository");
  }
  return response.json();
}

async function deleteRepo(id: string): Promise<void> {
  const response = await fetch(`/api/repos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Gagal menghapus repository");
  }
}

export function useRepos(params: FetchReposParams = {}) {
  return useQuery({
    queryKey: ["repos", params],
    queryFn: () => fetchRepos(params),
  });
}

export function useRepo(id: string) {
  return useQuery({
    queryKey: ["repos", id],
    queryFn: () => fetchRepo(id),
    enabled: !!id,
  });
}

export function useCreateRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      toast.success("Repository berhasil ditambahkan!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepoInput }) =>
      updateRepo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      toast.success("Repository berhasil diupdate!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
      toast.success("Repository berhasil dihapus!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
