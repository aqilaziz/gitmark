import { GitHubMetadata } from "@/types";

const GITHUB_API = "https://api.github.com";

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
): Promise<GitHubMetadata | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    return {
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      stargazers_count: data.stargazers_count,
      language: data.language,
      topics: data.topics || [],
      owner: {
        login: data.owner.login,
        avatar_url: data.owner.avatar_url,
      },
    };
  } catch (error) {
    console.error("Failed to fetch GitHub metadata:", error);
    return null;
  }
}
