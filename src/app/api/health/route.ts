import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic } from "@/lib/claude";

interface TestResult {
  status: "ok" | "error";
  latency_ms: number;
  detail?: string;
}

async function testSupabase(): Promise<TestResult> {
  const start = Date.now();
  try {
    // システムテーブルへの軽量クエリで接続確認
    const { error } = await supabase
      .from("_health_check_dummy")
      .select("*")
      .limit(1);

    // テーブルが無くても接続自体が成功すれば OK
    // 「relation does not exist」は接続成功の証拠
    const latency = Date.now() - start;
    if (error && !error.message.includes("does not exist") && !error.message.includes("schema cache")) {
      return { status: "error", latency_ms: latency, detail: error.message };
    }
    return { status: "ok", latency_ms: latency, detail: "Connected to Supabase" };
  } catch (e) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      detail: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

async function testClaude(): Promise<TestResult> {
  const start = Date.now();
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-3-5-20241022",
      max_tokens: 32,
      messages: [{ role: "user", content: "Say 'ok' in one word." }],
    });

    const latency = Date.now() - start;
    const block = response.content[0];
    const text = block.type === "text" ? block.text : "";
    return {
      status: "ok",
      latency_ms: latency,
      detail: `Model responded: "${text.trim()}"`,
    };
  } catch (e) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      detail: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

async function testGoogleMaps(): Promise<TestResult> {
  const start = Date.now();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return {
      status: "error",
      latency_ms: 0,
      detail: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set",
    };
  }

  try {
    // 東京駅でジオコーディングテスト
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent("東京駅")}&key=${apiKey}&language=ja`;
    const res = await fetch(url);
    const data = await res.json();
    const latency = Date.now() - start;

    if (data.status === "OK") {
      const addr = data.results[0]?.formatted_address ?? "";
      return {
        status: "ok",
        latency_ms: latency,
        detail: `Geocoded: "${addr}"`,
      };
    }

    return {
      status: "error",
      latency_ms: latency,
      detail: `Google API status: ${data.status} - ${data.error_message ?? ""}`,
    };
  } catch (e) {
    return {
      status: "error",
      latency_ms: Date.now() - start,
      detail: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function GET() {
  // 3つのテストを並列実行
  const [supabaseResult, claudeResult, googleMapsResult] = await Promise.all([
    testSupabase(),
    testClaude(),
    testGoogleMaps(),
  ]);

  const results = {
    timestamp: new Date().toISOString(),
    supabase: supabaseResult,
    claude_api: claudeResult,
    google_maps: googleMapsResult,
    all_ok:
      supabaseResult.status === "ok" &&
      claudeResult.status === "ok" &&
      googleMapsResult.status === "ok",
  };

  const httpStatus = results.all_ok ? 200 : 503;
  return NextResponse.json(results, { status: httpStatus });
}
