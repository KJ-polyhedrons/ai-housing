-- ========================================
-- AI住宅コンシェルジュ 初期スキーマ
-- ========================================

-- PostGIS拡張を有効化（距離計算用）
create extension if not exists postgis;

-- ========================================
-- users テーブル
-- ========================================
create table users (
  user_id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz default now()
);

-- ========================================
-- search_sessions テーブル
-- ========================================
create table search_sessions (
  session_id uuid primary key default gen_random_uuid(),
  user_id uuid references users(user_id),
  annual_income integer not null,
  family_size jsonb not null,
  work_location text not null,
  max_commute_min integer not null,
  budget_monthly integer not null,
  move_in_timing date,
  free_text text,
  ai_analysis jsonb,
  created_at timestamptz default now()
);

-- ========================================
-- properties テーブル
-- ========================================
create table properties (
  property_id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat float8,
  lng float8,
  rent_monthly integer,
  floor_plan text,
  area_sqm float4,
  nearest_station text,
  station_walk_min integer,
  property_type text default 'rent',
  source_url text,
  image_url text,
  created_at timestamptz default now()
);

-- ========================================
-- nurseries テーブル
-- ========================================
create table nurseries (
  nursery_id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat float8,
  lng float8,
  municipality text not null,
  official_url text,
  capacity integer,
  vacancy_status text default 'unknown',
  vacancy_updated_at timestamptz,
  avg_acceptance_rate float4,
  created_at timestamptz default now()
);

-- ========================================
-- school_districts テーブル
-- ========================================
create table school_districts (
  district_id uuid primary key default gen_random_uuid(),
  municipality text not null,
  elementary_school text not null,
  elementary_school_url text,
  junior_high_school text not null,
  junior_high_school_url text,
  review_url text,
  lat float8,
  lng float8,
  created_at timestamptz default now()
);

-- ========================================
-- ai_recommendations テーブル
-- ========================================
create table ai_recommendations (
  rec_id uuid primary key default gen_random_uuid(),
  session_id uuid references search_sessions(session_id) on delete cascade,
  property_id uuid references properties(property_id) on delete cascade,
  rank integer not null,
  nursery_score float4 default 0,
  school_score float4 default 0,
  commute_score float4 default 0,
  budget_score float4 default 0,
  total_score float4 default 0,
  enrollment_probability float4 default 0,
  enrollment_stars integer default 1,
  top_reasons jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ========================================
-- インデックス
-- ========================================
create index idx_properties_location on properties(lat, lng);
create index idx_nurseries_location on nurseries(lat, lng);
create index idx_nurseries_municipality on nurseries(municipality);
create index idx_school_districts_location on school_districts(lat, lng);
create index idx_ai_recommendations_session on ai_recommendations(session_id);
create index idx_search_sessions_created on search_sessions(created_at desc);
