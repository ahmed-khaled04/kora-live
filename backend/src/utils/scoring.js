export const calculatePoints = (predictedHome, predictedAway, actualHome, actualAway) => {
  if (predictedHome === actualHome && predictedAway === actualAway) return 5;

  const predictedOutcome = Math.sign(predictedHome - predictedAway);
  const actualOutcome = Math.sign(actualHome - actualAway);

  if (predictedOutcome === actualOutcome) return 2;

  return 0;
};
