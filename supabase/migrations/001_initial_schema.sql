-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- Tabel 1: profiles
-- Auto-create via trigger setelah user daftar
-- ============================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Tabel 2: repositories
-- ============================================
CREATE TABLE repositories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  name          TEXT NOT NULL,              -- "owner/repo"
  custom_title  TEXT,                       -- judul kustom dari user
  description   TEXT,                       -- catatan/deskripsi dari user
  is_favorite   BOOLEAN DEFAULT FALSE,
  
  -- Auto-fetched metadata (dari GitHub API)
  gh_description  TEXT,                     -- deskripsi asli dari GitHub
  language        TEXT,                     -- bahasa utama
  stars           INTEGER,
  topics          TEXT[],                   -- array string topics
  avatar_url      TEXT,                     -- owner avatar
  
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate repos per user
  UNIQUE(user_id, url)
);

-- Indexes
CREATE INDEX idx_repos_user_id ON repositories(user_id);
CREATE INDEX idx_repos_name ON repositories USING GIN (name gin_trgm_ops);
CREATE INDEX idx_repos_fav ON repositories(user_id, is_favorite);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_repo_updated
  BEFORE UPDATE ON repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Tabel 3: categories
-- ============================================
CREATE TABLE categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  color     TEXT DEFAULT '#6366f1',         -- hex color untuk badge
  icon      TEXT DEFAULT '📁',              -- emoji icon
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user ON categories(user_id);

-- ============================================
-- Tabel 4: repository_categories (Junction)
-- ============================================
CREATE TABLE repository_categories (
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (repository_id, category_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Repositories
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own repos" ON repositories
  FOR ALL USING (auth.uid() = user_id);

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Junction table
ALTER TABLE repository_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own repo categories" ON repository_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM repositories
      WHERE repositories.id = repository_categories.repository_id
      AND repositories.user_id = auth.uid()
    )
  );
