import { HistoryDetailClient } from "@/components/history-detail-client";

type HistoryDetailPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { sessionId } = await params;
  return <HistoryDetailClient sessionId={sessionId} />;
}
