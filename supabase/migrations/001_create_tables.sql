-- ========================================
-- AI住宅コンシェルジュ：テーブル定義
-- ========================================

-- 1. ユーザー
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 検索セッション
CREATE TABLE IF NOT EXISTS search_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  annual_income INTEGER NOT NULL,
  family_size JSONB NOT NULL DEFAULT '{"adults":2,"children":[]}',
  work_location TEXT NOT NULL DEFAULT '',
  max_commute_min INTEGER NOT NULL DEFAULT 60,
  budget_monthly INTEGER NOT NULL DEFAULT 0,
  move_in_timing TEXT NOT NULL DEFAULT '',
  free_text TEXT NOT NULL DEFAULT '',
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 物件
CREATE TABLE IF NOT EXISTS properties (
  property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  rent_monthly INTEGER NOT NULL,
  floor_plan TEXT NOT NULL DEFAULT '',
  area_sqm REAL NOT NULL DEFAULT 0,
  nearest_station TEXT NOT NULL DEFAULT '',
  station_walk_min INTEGER NOT NULL DEFAULT 0,
  property_type TEXT NOT NULL CHECK (property_type IN ('rent', 'buy')),
  source_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. 保育園
CREATE TABLE IF NOT EXISTS nurseries (
  nursery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  municipality TEXT NOT NULL DEFAULT '',
  official_url TEXT,
  capacity INTEGER NOT NULL DEFAULT 0,
  vacancy_status TEXT NOT NULL DEFAULT 'unknown'
    CHECK (vacancy_status IN ('available', 'none', 'unknown')),
  vacancy_updated_at TIMESTAMPTZ,
  avg_acceptance_rate REAL
);

-- 5. 学区
CREATE TABLE IF NOT EXISTS school_districts (
  district_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality TEXT NOT NULL,
  elementary_school TEXT NOT NULL,
  elementary_school_url TEXT,
  junior_high_school TEXT NOT NULL,
  junior_high_school_url TEXT,
  review_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

-- 6. AI推薦結果
CREATE TABLE IF NOT EXISTS ai_recommendations (
  rec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES search_sessions(session_id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  nursery_score REAL NOT NULL DEFAULT 0,
  school_score REAL NOT NULL DEFAULT 0,
  commute_score REAL NOT NULL DEFAULT 0,
  budget_score REAL NOT NULL DEFAULT 0,
  total_score REAL NOT NULL DEFAULT 0,
  enrollment_probability REAL NOT NULL DEFAULT 0,
  enrollment_stars INTEGER NOT NULL DEFAULT 0,
  top_reasons JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================
-- インデックス
-- ========================================
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (lat, lng);
CREATE INDEX IF NOT EXISTS idx_nurseries_location ON nurseries (lat, lng);
CREATE INDEX IF NOT EXISTS idx_nurseries_municipality ON nurseries (municipality);
CREATE INDEX IF NOT EXISTS idx_school_districts_municipality ON school_districts (municipality);
CREATE INDEX IF NOT EXISTS idx_recommendations_session ON ai_recommendations (session_id);
CREATE INDEX IF NOT EXISTS idx_search_sessions_user ON search_sessions (user_id);

-- ========================================
-- RLS（Row Level Security）
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- MVP段階: anon キーで全読み取り可能にする
CREATE POLICY "Allow public read on properties"
  ON properties FOR SELECT USING (true);

CREATE POLICY "Allow public read on nurseries"
  ON nurseries FOR SELECT USING (true);

CREATE POLICY "Allow public read on school_districts"
  ON school_districts FOR SELECT USING (true);

-- search_sessions / ai_recommendations は INSERT も許可（匿名ユーザー対応）
CREATE POLICY "Allow public insert on search_sessions"
  ON search_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on search_sessions"
  ON search_sessions FOR SELECT USING (true);

CREATE POLICY "Allow public insert on ai_recommendations"
  ON ai_recommendations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on ai_recommendations"
  ON ai_recommendations FOR SELECT USING (true);
