import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createRepoSchema } from "@/lib/validators";
import { parseGitHubUrl } from "@/lib/utils";
import { fetchRepoMetadata } from "@/lib/github";

// GET /api/repos - List semua repo user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const favorite = searchParams.get("favorite");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("repositories")
      .select(
        `
        *,
        categories:repository_categories(
          category:categories(*)
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,custom_title.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    // Favorite filter
    if (favorite === "true") {
      query = query.eq("is_favorite", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching repos:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data repository" },
        { status: 500 },
      );
    }

    // Filter by category if specified
    let filteredData = data;
    if (category) {
      filteredData = data?.filter((repo: Record<string, unknown>) =>
        (repo.categories as Array<Record<string, unknown>>)?.some(
          (rc: Record<string, unknown>) =>
            (rc.category as Record<string, unknown>)?.name === category,
        ),
      );
    }

    // Transform data to flatten categories
    const repos = filteredData?.map((repo: Record<string, unknown>) => ({
      ...repo,
      categories: (repo.categories as Array<Record<string, unknown>>)
        ?.map((rc: Record<string, unknown>) => rc.category)
        .filter(Boolean),
    }));

    return NextResponse.json(repos);
  } catch (error) {
    console.error("Error in GET /api/repos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/repos - Tambah repo baru
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createRepoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { url, custom_title, description, category_ids, is_favorite } =
      validation.data;

    // Parse GitHub URL
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "URL GitHub tidak valid" },
        { status: 400 },
      );
    }

    const repoName = `${parsed.owner}/${parsed.repo}`;

    // Check for duplicate
    const { data: existing } = await supabase
      .from("repositories")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Repository sudah ada di koleksi Anda" },
        { status: 409 },
      );
    }

    // Fetch metadata from GitHub API
    const metadata = await fetchRepoMetadata(parsed.owner, parsed.repo);

    // Insert repo
    const { data: repo, error: repoError } = await supabase
      .from("repositories")
      .insert({
        user_id: user.id,
        url,
        name: repoName,
        custom_title: custom_title || null,
        description: description || null,
        is_favorite: is_favorite || false,
        gh_description: metadata?.description || null,
        language: metadata?.language || null,
        stars: metadata?.stargazers_count || null,
        topics: metadata?.topics || null,
        avatar_url: metadata?.owner?.avatar_url || null,
      })
      .select()
      .single();

    if (repoError) {
      console.error("Error creating repo:", repoError);
      return NextResponse.json(
        { error: "Gagal menyimpan repository" },
        { status: 500 },
      );
    }

    // Insert category associations
    if (category_ids && category_ids.length > 0) {
      const junctionData = category_ids.map((catId) => ({
        repository_id: repo.id,
        category_id: catId,
      }));

      const { error: junctionError } = await supabase
        .from("repository_categories")
        .insert(junctionData);

      if (junctionError) {
        console.error("Error adding categories:", junctionError);
      }
    }

    // Fetch with categories
    const { data: fullRepo } = await supabase
      .from("repositories")
      .select(
        `
        *,
        categories:repository_categories(
          category:categories(*)
        )
      `,
      )
      .eq("id", repo.id)
      .single();

    const result = fullRepo
      ? {
          ...fullRepo,
          categories: (fullRepo as Record<string, unknown>).categories
            ? (
                (fullRepo as Record<string, unknown>).categories as Array<
                  Record<string, unknown>
                >
              )
                .map(
                  (rc: Record<string, unknown>) =>
                    (rc as Record<string, unknown>).category,
                )
                .filter(Boolean)
            : [],
        }
      : repo;

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/repos:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
