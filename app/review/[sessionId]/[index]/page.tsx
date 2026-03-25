import { ReviewMistakesClient } from "@/components/review-mistakes-client";

type ReviewPageProps = {
  params: Promise<{ sessionId: string; index: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { sessionId, index } = await params;
  return <ReviewMistakesClient index={Number(index)} sessionId={sessionId} />;
}
