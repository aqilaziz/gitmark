"use client";

import { RepoWithCategories } from "@/types";
import RepoCard from "./RepoCard";

interface RepoGridProps {
  repos: RepoWithCategories[];
}

export default function RepoGrid({ repos }: RepoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {repos.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
