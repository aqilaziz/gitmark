"use client";

import { RepoWithCategories } from "@/types";
import RepoListItem from "./RepoListItem";

interface RepoListProps {
  repos: RepoWithCategories[];
}

export default function RepoList({ repos }: RepoListProps) {
  return (
    <div className="flex flex-col gap-2">
      {repos.map((repo) => (
        <RepoListItem key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
