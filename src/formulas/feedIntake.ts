/**
 * FEEDNETICS Model - Feed Intake Control
 * Equations (A.1) - (A.3)
 */

import { FeedIntakeParams } from '../types';

/**
 * Equation (A.1): Maximum Feed Intake (Original Lupatsch Model)
 *
 * FI_max = a × BW^b × e^(cT) × I(T > T_low) × I(T < T_high)
 *
 * Uses indicator functions for temperature bounds
 *
 * @param bodyWeight Fish body weight (g)
 * @param temperature Current temperature (°C)
 * @param params Species-specific parameters
 * @returns Maximum feed intake (g/day)
 */
export function calculateFI_max_original(
  bodyWeight: number,
  temperature: number,
  params: FeedIntakeParams
): number {
  const { a, b, c, T_low, T_high } = params;

  // Indicator functions
  const I_low = temperature > T_low ? 1 : 0;
  const I_high = temperature < T_high ? 1 : 0;

  return a * Math.pow(bodyWeight, b) * Math.exp(c * temperature) * I_low * I_high;
}

/**
 * Equation (A.2): Maximum Feed Intake (Smooth Approximation)
 *
 * FI_max = a × BW^b × e^(cT) × [1/(1 + (T_low/T)^β)] × [1/(1 + (T/T_high)^β)]
 *
 * Smooth sigmoid functions replace step functions for numerical stability
 *
 * @param bodyWeight Fish body weight (g)
 * @param temperature Current temperature (°C)
 * @param params Species-specific parameters
 * @returns Maximum feed intake (g/day)
 */
export function calculateFI_max_smooth(
  bodyWeight: number,
  temperature: number,
  params: FeedIntakeParams
): number {
  const { a, b, c, T_low, T_high, beta } = params;

  // Prevent division by zero
  const T = Math.max(temperature, 0.001);

  // Base feed intake
  const baseFI = a * Math.pow(bodyWeight, b) * Math.exp(c * T);

  // Smooth temperature bounds (sigmoid functions)
  const lowTempFactor = 1 / (1 + Math.pow(T_low / T, beta));
  const highTempFactor = 1 / (1 + Math.pow(T / T_high, beta));

  return baseFI * lowTempFactor * highTempFactor;
}

/**
 * Equation (A.3): Actual Feed Intake
 *
 * FI = min(FI_max, feed_given)
 *
 * Fish cannot eat more than maximum capacity or what is given
 *
 * @param FI_max Maximum feed intake (g/day)
 * @param feedGiven Feed given by farmer (g/day)
 * @returns Actual feed intake (g/day)
 */
export function calculateActualFeedIntake(
  FI_max: number,
  feedGiven: number
): number {
  return Math.min(FI_max, feedGiven);
}

/**
 * Combined feed intake calculation (uses smooth approximation)
 *
 * @param bodyWeight Fish body weight (g)
 * @param temperature Current temperature (°C)
 * @param feedGiven Feed given by farmer (g/day)
 * @param params Species-specific parameters
 * @returns Actual feed intake (g/day)
 */
export function calculateFeedIntake(
  bodyWeight: number,
  temperature: number,
  feedGiven: number,
  params: FeedIntakeParams
): number {
  const FI_max = calculateFI_max_smooth(bodyWeight, temperature, params);
  return calculateActualFeedIntake(FI_max, feedGiven);
}

/**
 * Calculate feed intake from feeding table
 * (% body weight/day per fish weight class and temperature class)
 *
 * @param bodyWeight Fish body weight (g)
 * @param temperature Current temperature (°C)
 * @param feedingTable Feeding table (% BW/day)
 * @returns Feed given (g/day)
 */
export function feedFromTable(
  bodyWeight: number,
  temperature: number,
  feedingTable: { weightClass: number; tempClass: number; percent: number }[]
): number {
  // Find closest weight and temperature class
  const closest = feedingTable.reduce((best, entry) => {
    const distWeight = Math.abs(entry.weightClass - bodyWeight);
    const distTemp = Math.abs(entry.tempClass - temperature);
    const dist = distWeight + distTemp * 10; // Weight temperature more
    const bestDist = Math.abs(best.weightClass - bodyWeight) + Math.abs(best.tempClass - temperature) * 10;
    return dist < bestDist ? entry : best;
  }, feedingTable[0]);

  return (closest.percent / 100) * bodyWeight;
}
