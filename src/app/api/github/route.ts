import { NextRequest, NextResponse } from "next/server";
import { fetchRepoMetadata } from "@/lib/github";
import { parseGitHubUrl } from "@/lib/utils";

// POST /api/github - Fetch metadata dari GitHub URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, owner: reqOwner, repo: reqRepo } = body;

    let owner = reqOwner;
    let repo = reqRepo;

    // If URL is provided, parse it
    if (url && !owner && !repo) {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return NextResponse.json(
          { error: "URL GitHub tidak valid" },
          { status: 400 },
        );
      }
      owner = parsed.owner;
      repo = parsed.repo;
    }

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner dan repo diperlukan" },
        { status: 400 },
      );
    }

    const metadata = await fetchRepoMetadata(owner, repo);

    if (!metadata) {
      return NextResponse.json(
        { error: "Gagal mengambil metadata dari GitHub" },
        { status: 404 },
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error in POST /api/github:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
