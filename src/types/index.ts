export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Repository {
  id: string;
  user_id: string;
  url: string;
  name: string;
  custom_title: string | null;
  description: string | null;
  is_favorite: boolean;
  gh_description: string | null;
  language: string | null;
  stars: number | null;
  topics: string[] | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface RepositoryCategory {
  repository_id: string;
  category_id: string;
}

export interface RepoWithCategories extends Repository {
  categories: Category[];
}

export interface GitHubMetadata {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

export type ViewMode = "grid" | "list";
