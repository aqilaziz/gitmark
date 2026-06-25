import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createCategorySchema } from "@/lib/validators";

// GET /api/categories - List semua kategori user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data kategori" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/categories - Buat kategori baru
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
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { name, color, icon } = validation.data;

    // Check for duplicate
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        color: color || "#6366f1",
        icon: icon || "📁",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Gagal membuat kategori" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
