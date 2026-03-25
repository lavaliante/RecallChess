import { SoundLink } from "@/components/sound-link";
import { SoundToggle } from "@/components/sound-toggle";
import { ExerciseLibrary } from "@/components/exercise-library";
import exercises from "@/data/exercises";

export default function ExercisesPage() {
  return (
    <main className="page-shell">
      <section className="hero-card browse-header">
        <div className="button-row browse-topbar">
          <SoundLink className="button-ghost" href="/">
            Back Home
          </SoundLink>
          <SoundToggle />
        </div>
        <p className="eyebrow">Exercise Library</p>
        <h1>All Exercises</h1>
        <p className="hero-copy">
          Browse the full library, launch any line as a standalone exercise, or use the
          home screen for timed training sessions.
        </p>
      </section>

      <ExerciseLibrary exercises={exercises} />
    </main>
  );
}
