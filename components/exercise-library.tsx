"use client";

import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/exercise-card";
import type { Exercise } from "@/lib/types";

type ExerciseLibraryProps = {
  exercises: Exercise[];
};

function matchesExercise(exercise: Exercise, query: string) {
  const haystack = [
    exercise.title,
    exercise.category,
    exercise.difficulty,
    exercise.moves.join(" "),
    `${exercise.moves.length}`,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function ExerciseLibrary({ exercises }: ExerciseLibraryProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const filteredExercises = useMemo(() => {
    if (!normalizedSearch) {
      return exercises;
    }

    return exercises.filter((exercise) => matchesExercise(exercise, normalizedSearch));
  }, [exercises, normalizedSearch]);

  return (
    <section className="section-block">
      <div className="section-heading exercise-library-head">
        <div>
          <h2>Exercise List</h2>
          <p>Search by title, opening, difficulty, or move text.</p>
        </div>
        <div className="searchbox-wrap">
          <label className="sr-only" htmlFor="exercise-search">
            Search exercises
          </label>
          <input
            className="searchbox"
            id="exercise-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exercises"
            type="search"
            value={search}
          />
          <span className="search-meta">
            {filteredExercises.length} of {exercises.length} exercises
          </span>
        </div>
      </div>

      {filteredExercises.length > 0 ? (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="panel empty-state">
          <h3>No exercises found</h3>
          <p className="card-copy">Try a different title, opening name, difficulty, or move.</p>
        </div>
      )}
    </section>
  );
}
