import { PageHeader } from "@/components/layout/page-header";
import { InsightsClient } from "@/components/insights/insights-client";

export default function InsightsPage() {
  return (
    <div>
      <PageHeader
        title="ML Insights"
        description="Model explainability powered by SHAP — global feature importance and per-prediction explanations."
      />
      <InsightsClient />
    </div>
  );
}
