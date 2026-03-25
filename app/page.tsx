import { SessionLauncher } from "@/components/session-launcher";
import exercises from "@/data/exercises";

export default function HomePage() {
  const availableDifficulties = Array.from(
    new Set(exercises.map((exercise) => exercise.difficulty)),
  );

  return (
    <main className="page-shell quick-start-shell">
      <SessionLauncher availableDifficulties={availableDifficulties} />
    </main>
  );
}
