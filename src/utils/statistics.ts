// src/utils/statistics.ts

/**
 * Calculate the mean of an array of numbers
 * @param values Array of numbers
 * @returns The mean value
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 * @param values Array of numbers
 * @returns The standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;

  const mean = calculateMean(values);
  const squaredDifferences = values.map((value) => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDifferences);

  return Math.sqrt(variance);
}

/**
 * Calculate the median of an array of numbers
 * @param values Array of numbers
 * @returns The median value
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2;
  } else {
    return sortedValues[midpoint];
  }
}

/**
 * Calculate the percentile of an array of numbers
 * @param values Array of numbers
 * @param percentile The percentile to calculate (0-100)
 * @returns The value at the specified percentile
 */
export function calculatePercentile(
  values: number[],
  percentile: number
): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100)
    throw new Error('Percentile must be between 0 and 100');

  const sortedValues = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];

  const lowerValue = sortedValues[lowerIndex];
  const upperValue = sortedValues[upperIndex];
  const fraction = index - lowerIndex;

  return lowerValue + (upperValue - lowerValue) * fraction;
}

/**
 * Calculate the utilization rate
 * @param busyTime Total time the resource was busy
 * @param totalTime Total time period
 * @returns Utilization rate (0-1)
 */
export function calculateUtilization(
  busyTime: number,
  totalTime: number
): number {
  if (totalTime <= 0) return 0;
  return busyTime / totalTime;
}

/**
 * Format minutes as hours and minutes
 * @param minutes Total minutes
 * @returns Formatted string (e.g., "2h 30m")
 */
export function formatTime(minutes: number): string {
  if (minutes < 1) {
    return Math.round(minutes * 60) + 's';
  }

  if (minutes < 60) {
    return Math.round(minutes) + 'm';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return hours + 'h';
  }

  return hours + 'h ' + remainingMinutes + 'm';
}

/**
 * Formats a percentage value
 * @param value Value between 0 and 1
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%';
}
