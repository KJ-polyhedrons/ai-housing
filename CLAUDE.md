# AI住宅コンシェルジュ

子育て世帯向けAI住宅コンシェルジュ MVP

## 技術スタック
- Next.js 14+ (App Router) / TypeScript / Tailwind CSS v4
- shadcn/ui (コンポーネントライブラリ)
- Supabase (PostgreSQL + Auth + Storage)
- Claude API (@anthropic-ai/sdk) - モデル: claude-sonnet-4-20250514
- Google Maps API (Geocoding + Embed)
- Zustand (状態管理)
- Vercel (デプロイ)

## ディレクトリ構成
- `src/app/` - Next.js App Router ページ・API Routes
- `src/components/` - UIコンポーネント（layout / search / property / map / common）
- `src/lib/` - ユーティリティ（supabase / claude / geocoding / scoring / prompts）
- `src/stores/` - Zustand ストア
- `src/types/` - TypeScript 型定義
- `supabase/` - マイグレーション・シードデータ

## 開発ルール
- 日本語でコメント・UI文言を記述
- .env.local は読み書きしない（環境変数の値をコードにハードコードしない）
- shadcn/ui コンポーネントを優先的に使用
- API Route は src/app/api/ 配下に配置
- 型定義は src/types/ に集約

## コマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run lint` - ESLint実行
