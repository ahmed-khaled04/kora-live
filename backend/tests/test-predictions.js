import prisma from "../src/config/prisma.js";
import { calculatePoints } from "../src/utils/scoring.js";
import { scorePredicion } from "../src/jobs/prediction-scorer.job.js";

const MATCH_ID = "c471e58f-e057-4637-9afb-c4b2a0b381aa";
const USER_ID = "efe6863c-b30b-41e0-a55c-e0914500e0e5";

// --- 1. Unit test scoring logic ---
console.log("=== Scoring Logic ===");
console.log(
  "Exact score (2-1 vs 2-1):",
  calculatePoints(2, 1, 2, 1),
  "→ expect 5",
);
console.log(
  "Correct outcome (2-0 vs 3-0):",
  calculatePoints(2, 0, 3, 0),
  "→ expect 2",
);
console.log(
  "Correct draw (1-1 vs 0-0):",
  calculatePoints(1, 1, 0, 0),
  "→ expect 2",
);
console.log("Wrong (2-1 vs 0-1):", calculatePoints(2, 1, 0, 1), "→ expect 0");

// --- 2. Seed a finished match with known scores ---
console.log("\n=== Scorer Job ===");
await prisma.match.update({
  where: { id: MATCH_ID },
  data: { status: "FINISHED", homeScore: 2, awayScore: 1 },
});
console.log("Match set to FINISHED with score 2-1");

// --- 3. Seed predictions ---
await prisma.prediction.deleteMany({ where: { matchId: MATCH_ID } });

await prisma.prediction.createMany({
  data: [
    { userId: USER_ID, matchId: MATCH_ID, predictedHome: 2, predictedAway: 1 }, // exact → 5pts
    { userId: USER_ID, matchId: MATCH_ID, predictedHome: 3, predictedAway: 0 }, // correct outcome → 2pts
    { userId: USER_ID, matchId: MATCH_ID, predictedHome: 0, predictedAway: 1 }, // wrong → 0pts
  ],
  skipDuplicates: true,
});
console.log("Seeded 3 predictions");

// --- 4. Run scorer ---
await scorePredicion(MATCH_ID);
console.log("Scorer job ran");

// --- 5. Check results ---
const predictions = await prisma.prediction.findMany({
  where: { matchId: MATCH_ID },
  orderBy: { predictedHome: "desc" },
});

console.log("\nResults:");
predictions.forEach((p) => {
  console.log(
    `  predicted ${p.predictedHome}-${p.predictedAway} → ${p.pointsEarned}pts, scored: ${p.scored}`,
  );
});

// --- 6. Reset match back to SCHEDULED ---
await prisma.match.update({
  where: { id: MATCH_ID },
  data: { status: "SCHEDULED", homeScore: null, awayScore: null },
});
console.log("\nMatch reset to SCHEDULED");

await prisma.$disconnect();
