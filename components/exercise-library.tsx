"use client";

import { useMemo, useState } from "react";
import { ExerciseCard } from "@/components/exercise-card";
import { SoundButton } from "@/components/sound-button";
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<Exercise["difficulty"] | null>(null);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = !normalizedSearch || matchesExercise(exercise, normalizedSearch);
      const matchesCategory = !categoryFilter || exercise.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || exercise.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [categoryFilter, difficultyFilter, exercises, normalizedSearch]);

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter(null);
    setDifficultyFilter(null);
  };

  return (
    <section className="section-block">
      <div className="section-heading exercise-library-head">
        <div>
          <h2>Exercise List</h2>
          <p>Search by title, opening, difficulty, or move text. Click a category or difficulty to filter.</p>
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
          <div className="search-toolbar">
            <span className="search-meta">
              {filteredExercises.length} of {exercises.length} exercises
            </span>
            {categoryFilter ? <span className="badge">Category: {categoryFilter}</span> : null}
            {difficultyFilter ? <span className="badge">Difficulty: {difficultyFilter}</span> : null}
            {search || categoryFilter || difficultyFilter ? (
              <SoundButton className="button-ghost search-clear" onClick={clearFilters} type="button">
                Clear Filters
              </SoundButton>
            ) : null}
          </div>
        </div>
      </div>

      {filteredExercises.length > 0 ? (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              exercise={exercise}
              key={exercise.id}
              onCategoryClick={setCategoryFilter}
              onDifficultyClick={setDifficultyFilter}
            />
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
