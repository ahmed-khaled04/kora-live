import { scorePrediction } from "../src/jobs/prediction-scorer.job.js";

const matchId = process.argv[2];

if (!matchId) {
  console.error("Usage: node src/scripts/score-test.js <matchId>");
  process.exit(1);
}

console.log(`Scoring predictions for match ${matchId}...`);
await scorePrediction(matchId);
console.log("Done.");
process.exit(0);
