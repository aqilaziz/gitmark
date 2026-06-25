import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { updateRepoSchema } from "@/lib/validators";

// GET /api/repos/[id] - Detail satu repo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("repositories")
      .select(
        `
        *,
        categories:repository_categories(
          category:categories(*)
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Repository tidak ditemukan" },
        { status: 404 },
      );
    }

    const repo = {
      ...data,
      categories: (data as Record<string, unknown>).categories
        ? (
            (data as Record<string, unknown>).categories as Array<
              Record<string, unknown>
            >
          )
            .map(
              (rc: Record<string, unknown>) =>
                (rc as Record<string, unknown>).category,
            )
            .filter(Boolean)
        : [],
    };

    return NextResponse.json(repo);
  } catch (error) {
    console.error("Error in GET /api/repos/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/repos/[id] - Edit repo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateRepoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { category_ids, ...updateData } = validation.data;

    // Verify ownership
    const { data: existing } = await supabase
      .from("repositories")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: "Repository tidak ditemukan" },
        { status: 404 },
      );
    }

    // Update repo fields
    const { error: updateError } = await supabase
      .from("repositories")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating repo:", updateError);
      return NextResponse.json(
        { error: "Gagal mengupdate repository" },
        { status: 500 },
      );
    }

    // Update categories if provided
    if (category_ids !== undefined) {
      // Remove existing associations
      await supabase
        .from("repository_categories")
        .delete()
        .eq("repository_id", id);

      // Add new associations
      if (category_ids.length > 0) {
        const junctionData = category_ids.map((catId) => ({
          repository_id: id,
          category_id: catId,
        }));

        const { error: junctionError } = await supabase
          .from("repository_categories")
          .insert(junctionData);

        if (junctionError) {
          console.error("Error updating categories:", junctionError);
        }
      }
    }

    // Fetch updated repo with categories
    const { data: updatedRepo } = await supabase
      .from("repositories")
      .select(
        `
        *,
        categories:repository_categories(
          category:categories(*)
        )
      `,
      )
      .eq("id", id)
      .single();

    const result = updatedRepo
      ? {
          ...updatedRepo,
          categories: (updatedRepo as Record<string, unknown>).categories
            ? (
                (updatedRepo as Record<string, unknown>).categories as Array<
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
      : null;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PATCH /api/repos/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/repos/[id] - Hapus repo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership and delete
    const { error } = await supabase
      .from("repositories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting repo:", error);
      return NextResponse.json(
        { error: "Gagal menghapus repository" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/repos/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
