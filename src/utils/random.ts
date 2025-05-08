// src/utils/random.ts

/**
 * Generates a random time from an exponential distribution with the given mean
 * Exponential distributions are commonly used for modeling service times
 * @param mean - The mean time in minutes
 * @returns Random time in minutes
 */
export function generateExponentialTime(mean: number): number {
  // Generate a random number between 0 and 1
  const u = Math.random();

  // Convert to exponential distribution
  // Use -mean * ln(1-u) formula
  return -mean * Math.log(1 - u);
}

/**
 * Generates a random time from a uniform distribution within a range
 * @param min - Minimum time in minutes
 * @param max - Maximum time in minutes
 * @returns Random time in minutes
 */
export function generateUniformTime(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Generates a random number following the Poisson distribution
 * Useful for modeling arrival rates in queuing scenarios
 * @param lambda - The mean rate
 * @returns Random number from Poisson distribution
 */
export function generatePoissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p = p * Math.random();
  } while (p > L);

  return k - 1;
}

/**
 * Simulates a weighted coin toss
 * @param probabilityTrue - Probability of returning true (between 0 and 1)
 * @returns True or false based on probability
 */
export function weightedCoinToss(probabilityTrue: number): boolean {
  return Math.random() < probabilityTrue;
}

/**
 * Generates a random integer within a range, inclusive
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer
 */
export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
