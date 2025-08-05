/**
 * Generates a realistic AI rating for startup ideas
 * Uses weighted random distribution to simulate actual AI evaluation
 */
export function generateAIRating(): number {
  // Weighted distribution favoring higher ratings (60-95 range for realism)
  const weights = [
    { min: 60, max: 70, weight: 0.2 },  // Lower ratings - 20%
    { min: 70, max: 80, weight: 0.3 },  // Medium ratings - 30%
    { min: 80, max: 90, weight: 0.35 }, // Good ratings - 35%
    { min: 90, max: 95, weight: 0.15 }, // Excellent ratings - 15%
  ];

  const random = Math.random();
  let cumulative = 0;

  for (const bucket of weights) {
    cumulative += bucket.weight;
    if (random <= cumulative) {
      return Math.floor(Math.random() * (bucket.max - bucket.min + 1)) + bucket.min;
    }
  }

  // Fallback (should not reach here)
  return Math.floor(Math.random() * 35) + 60;
}

/**
 * Simulates AI analysis delay for better UX
 */
export function simulateAIProcessing(): Promise<number> {
  return new Promise((resolve) => {
    const delay = Math.random() * 1000 + 1000; // 1-2 second delay
    setTimeout(() => {
      resolve(generateAIRating());
    }, delay);
  });
}
