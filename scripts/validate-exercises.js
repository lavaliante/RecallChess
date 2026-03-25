const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");

const filePath = path.join(__dirname, "..", "data", "exercises.json");
const exercises = JSON.parse(fs.readFileSync(filePath, "utf8"));

const idSet = new Set();
const difficultyCounts = new Map();
const categoryCounts = new Map();

for (const exercise of exercises) {
  if (idSet.has(exercise.id)) {
    throw new Error(`Duplicate exercise id: ${exercise.id}`);
  }
  idSet.add(exercise.id);

  difficultyCounts.set(
    exercise.difficulty,
    (difficultyCounts.get(exercise.difficulty) ?? 0) + 1,
  );
  categoryCounts.set(
    exercise.category,
    (categoryCounts.get(exercise.category) ?? 0) + 1,
  );

  const chess = new Chess();
  for (const move of exercise.moves) {
    try {
      chess.move(move);
    } catch (error) {
      throw new Error(
        `Invalid move \"${move}\" in exercise ${exercise.id} (${exercise.title}): ${error.message}`,
      );
    }
  }
}

console.log(`Validated ${exercises.length} exercises.`);
console.log("Difficulty breakdown:");
for (const [difficulty, count] of [...difficultyCounts.entries()].sort()) {
  console.log(`- ${difficulty}: ${count}`);
}
console.log("Category breakdown:");
for (const [category, count] of [...categoryCounts.entries()].sort()) {
  console.log(`- ${category}: ${count}`);
}
