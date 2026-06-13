"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FeatureImportance {
  feature: string;
  importance: number;
}
interface ExplainResponse {
  model_id: string;
  feature_importance: FeatureImportance[];
  base_value: number | null;
  sample_explanation?: {
    sample_index: number;
    contributions: { feature: string; contribution: number }[];
  };
}

const SAMPLE = {
  task: "regression",
  algorithm: "random_forest",
  features: [[1, 2], [2, 1], [3, 4], [4, 3], [5, 6], [6, 5]],
  target: [3, 3, 7, 7, 11, 11],
};

export function InsightsClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);

  async function runDemo() {
    setLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const trainRes = await fetch("/api/ml/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE),
      });
      const trained = await trainRes.json();
      if (!trainRes.ok) throw new Error(trained.error ?? "Training failed");

      const explainRes = await fetch("/api/ml/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: trained.model_id,
          features: SAMPLE.features,
          sample_index: 0,
          feature_names: ["feature_a", "feature_b"],
        }),
      });
      const data = await explainRes.json();
      if (!explainRes.ok) throw new Error(data.error ?? "Explain failed");
      setExplanation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  const maxImportance = explanation
    ? Math.max(...explanation.feature_importance.map((f) => f.importance), 1e-9)
    : 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run a SHAP explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Trains a sample random-forest regressor and computes SHAP feature
            importance plus a per-prediction explanation. Requires the ML
            service to be running.
          </p>
          <Button onClick={runDemo} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run demo explanation
          </Button>
          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {explanation ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Global feature importance (mean |SHAP|)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {explanation.feature_importance.map((f) => (
                <div key={f.feature}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-mono">{f.feature}</span>
                    <span className="text-muted-foreground">{f.importance.toFixed(4)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(f.importance / maxImportance) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {explanation.sample_explanation ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Prediction explanation — sample #{explanation.sample_explanation.sample_index}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {explanation.base_value !== null ? (
                  <p className="text-sm text-muted-foreground">
                    Base value: {explanation.base_value.toFixed(4)}
                  </p>
                ) : null}
                {explanation.sample_explanation.contributions.map((c) => (
                  <div key={c.feature} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{c.feature}</span>
                    <Badge variant={c.contribution >= 0 ? "success" : "danger"}>
                      {c.contribution >= 0 ? "+" : ""}
                      {c.contribution.toFixed(4)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
