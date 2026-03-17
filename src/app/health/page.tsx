"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Activity } from "lucide-react";

interface TestResult {
  status: "ok" | "error";
  latency_ms: number;
  detail?: string;
}

interface HealthResponse {
  timestamp: string;
  supabase: TestResult;
  claude_api: TestResult;
  google_maps: TestResult;
  all_ok: boolean;
}

function StatusBadge({ status }: { status: "ok" | "error" }) {
  return status === "ok" ? (
    <Badge className="bg-green-600 text-white">
      <CheckCircle className="mr-1 h-3 w-3" /> OK
    </Badge>
  ) : (
    <Badge variant="destructive">
      <XCircle className="mr-1 h-3 w-3" /> ERROR
    </Badge>
  );
}

function ResultCard({
  title,
  result,
}: {
  title: string;
  result: TestResult;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <StatusBadge status={result.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>レイテンシ: {result.latency_ms}ms</p>
        {result.detail && <p className="break-all">{result.detail}</p>}
      </CardContent>
    </Card>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health");
      const json: HealthResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "接続テストに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          接続テスト
        </h1>
        <Button onClick={runTest} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              テスト中...
            </>
          ) : (
            "テスト実行"
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              総合ステータス:
            </span>
            {data.all_ok ? (
              <Badge className="bg-green-600 text-white text-base px-3 py-1">
                ✅ ALL OK
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-base px-3 py-1">
                ⚠️ 一部エラーあり
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(data.timestamp).toLocaleString("ja-JP")}
            </span>
          </div>

          <div className="grid gap-4">
            <ResultCard title="Supabase" result={data.supabase} />
            <ResultCard title="Claude API" result={data.claude_api} />
            <ResultCard title="Google Maps" result={data.google_maps} />
          </div>
        </>
      )}

      {!data && !loading && (
        <p className="text-center text-muted-foreground py-12">
          「テスト実行」ボタンを押して接続を確認してください
        </p>
      )}
    </div>
  );
}
