/**
 * FEEDNETICS Model - Performance Indicators
 *
 * This module calculates fish growth performance metrics
 * used for model validation and farm management
 */

/**
 * Relative Growth Rate (RGR)
 *
 * RGR = (e^((ln(ABW_final) - ln(ABW_initial)) / days) - 1) × 100
 *
 * Measures instantaneous growth rate as percentage per day
 *
 * @param ABW_initial Initial average body weight (g)
 * @param ABW_final Final average body weight (g)
 * @param days Number of days between measurements
 * @returns Relative growth rate (%/day)
 */
export function calculateRGR(
  ABW_initial: number,
  ABW_final: number,
  days: number
): number {
  if (ABW_initial <= 0 || ABW_final <= 0 || days <= 0) return 0;

  const lnRatio = (Math.log(ABW_final) - Math.log(ABW_initial)) / days;
  return (Math.exp(lnRatio) - 1) * 100;
}

/**
 * Specific Growth Rate (SGR)
 *
 * SGR = ((ln(W_final) - ln(W_initial)) / days) × 100
 *
 * Traditional growth rate metric in aquaculture
 *
 * @param W_initial Initial weight (g)
 * @param W_final Final weight (g)
 * @param days Number of days
 * @returns Specific growth rate (%/day)
 */
export function calculateSGR(
  W_initial: number,
  W_final: number,
  days: number
): number {
  if (W_initial <= 0 || W_final <= 0 || days <= 0) return 0;

  return ((Math.log(W_final) - Math.log(W_initial)) / days) * 100;
}

/**
 * Feed Conversion Ratio (FCR)
 *
 * FCR = total_feed_consumed / weight_gain
 *
 * Lower FCR indicates better feed efficiency
 *
 * @param totalFeedConsumed Total feed consumed (g)
 * @param weightGain Weight gained (g)
 * @returns Feed conversion ratio (g feed / g gain)
 */
export function calculateFCR(
  totalFeedConsumed: number,
  weightGain: number
): number {
  if (weightGain <= 0) return Infinity;
  return totalFeedConsumed / weightGain;
}

/**
 * Feed Efficiency (FE)
 *
 * FE = weight_gain / total_feed_consumed × 100
 *
 * Inverse of FCR, expressed as percentage
 *
 * @param weightGain Weight gained (g)
 * @param totalFeedConsumed Total feed consumed (g)
 * @returns Feed efficiency (%)
 */
export function calculateFeedEfficiency(
  weightGain: number,
  totalFeedConsumed: number
): number {
  if (totalFeedConsumed <= 0) return 0;
  return (weightGain / totalFeedConsumed) * 100;
}

/**
 * Protein Efficiency Ratio (PER)
 *
 * PER = weight_gain / protein_consumed
 *
 * Measures efficiency of protein utilization for growth
 *
 * @param weightGain Weight gained (g)
 * @param proteinConsumed Protein consumed (g)
 * @returns Protein efficiency ratio (g gain / g protein)
 */
export function calculatePER(
  weightGain: number,
  proteinConsumed: number
): number {
  if (proteinConsumed <= 0) return 0;
  return weightGain / proteinConsumed;
}

/**
 * Nitrogen Retention Efficiency (NRE)
 *
 * NRE = (N_retained / N_consumed) × 100
 *
 * Measures efficiency of dietary nitrogen conversion to body protein
 *
 * @param nitrogenRetained Nitrogen retained in body (g)
 * @param nitrogenConsumed Digestible nitrogen consumed (g)
 * @returns Nitrogen retention efficiency (%)
 */
export function calculateNRE(
  nitrogenRetained: number,
  nitrogenConsumed: number
): number {
  if (nitrogenConsumed <= 0) return 0;
  return (nitrogenRetained / nitrogenConsumed) * 100;
}

/**
 * Lipid Retention Efficiency (LRE)
 *
 * LRE = (lipid_retained / lipid_consumed) × 100
 *
 * @param lipidRetained Lipid retained in body (g)
 * @param lipidConsumed Digestible lipid consumed (g)
 * @returns Lipid retention efficiency (%)
 */
export function calculateLRE(
  lipidRetained: number,
  lipidConsumed: number
): number {
  if (lipidConsumed <= 0) return 0;
  return (lipidRetained / lipidConsumed) * 100;
}

/**
 * Energy Retention Efficiency (ERE)
 *
 * ERE = (energy_retained / digestible_energy_consumed) × 100
 *
 * @param energyRetained Energy retained in body (kJ)
 * @param digestibleEnergy Digestible energy consumed (kJ)
 * @returns Energy retention efficiency (%)
 */
export function calculateERE(
  energyRetained: number,
  digestibleEnergy: number
): number {
  if (digestibleEnergy <= 0) return 0;
  return (energyRetained / digestibleEnergy) * 100;
}

/**
 * Thermal Growth Coefficient (TGC)
 *
 * TGC = (W_final^(1/3) - W_initial^(1/3)) / (Σ(T × days)) × 1000
 *
 * Growth coefficient normalized for temperature
 *
 * @param W_initial Initial weight (g)
 * @param W_final Final weight (g)
 * @param degreeDays Sum of (temperature × days) over the period
 * @returns Thermal growth coefficient
 */
export function calculateTGC(
  W_initial: number,
  W_final: number,
  degreeDays: number
): number {
  if (W_initial <= 0 || W_final <= 0 || degreeDays <= 0) return 0;

  const cubicRootDiff = Math.pow(W_final, 1 / 3) - Math.pow(W_initial, 1 / 3);
  return (cubicRootDiff / degreeDays) * 1000;
}

/**
 * Condition Factor (K)
 *
 * K = (W / L^3) × 100
 *
 * Fulton's condition factor, indicates fish "condition" or robustness
 *
 * @param weight Body weight (g)
 * @param length Total length (cm)
 * @returns Condition factor
 */
export function calculateConditionFactor(
  weight: number,
  length: number
): number {
  if (length <= 0) return 0;
  return (weight / Math.pow(length, 3)) * 100;
}

/**
 * Hepatosomatic Index (HSI)
 *
 * HSI = (liver_weight / body_weight) × 100
 *
 * Indicator of liver condition and energy reserves
 *
 * @param liverWeight Liver weight (g)
 * @param bodyWeight Body weight (g)
 * @returns Hepatosomatic index (%)
 */
export function calculateHSI(
  liverWeight: number,
  bodyWeight: number
): number {
  if (bodyWeight <= 0) return 0;
  return (liverWeight / bodyWeight) * 100;
}

/**
 * Viscerosomatic Index (VSI)
 *
 * VSI = (viscera_weight / body_weight) × 100
 *
 * @param visceraWeight Viscera weight (g)
 * @param bodyWeight Body weight (g)
 * @returns Viscerosomatic index (%)
 */
export function calculateVSI(
  visceraWeight: number,
  bodyWeight: number
): number {
  if (bodyWeight <= 0) return 0;
  return (visceraWeight / bodyWeight) * 100;
}

/**
 * Survival Rate
 *
 * Survival = (N_final / N_initial) × 100
 *
 * @param initialCount Initial number of fish
 * @param finalCount Final number of fish
 * @returns Survival rate (%)
 */
export function calculateSurvivalRate(
  initialCount: number,
  finalCount: number
): number {
  if (initialCount <= 0) return 0;
  return (finalCount / initialCount) * 100;
}

/**
 * Daily Feed Intake Rate (DFI)
 *
 * DFI = (daily_feed_intake / body_weight) × 100
 *
 * @param dailyFeedIntake Daily feed intake (g/day)
 * @param bodyWeight Body weight (g)
 * @returns Daily feed intake rate (% BW/day)
 */
export function calculateDFI(
  dailyFeedIntake: number,
  bodyWeight: number
): number {
  if (bodyWeight <= 0) return 0;
  return (dailyFeedIntake / bodyWeight) * 100;
}

/**
 * Calculate all performance metrics from time series data
 */
export interface PerformanceData {
  initialWeight: number;
  finalWeight: number;
  days: number;
  totalFeedConsumed: number;
  proteinConsumed: number;
  lipidConsumed: number;
  digestibleEnergy: number;
  proteinRetained: number;
  lipidRetained: number;
  energyRetained: number;
  degreeDays: number;
}

export interface PerformanceMetrics {
  RGR: number;
  SGR: number;
  FCR: number;
  FE: number;
  PER: number;
  NRE: number;
  LRE: number;
  ERE: number;
  TGC: number;
  weightGain: number;
}

/**
 * Calculate comprehensive performance metrics
 *
 * @param data Performance data from simulation
 * @returns All calculated performance metrics
 */
export function calculatePerformanceMetrics(data: PerformanceData): PerformanceMetrics {
  const weightGain = data.finalWeight - data.initialWeight;

  // Nitrogen content approximation (protein is ~16% N)
  const N_FRACTION = 0.16;
  const nitrogenConsumed = data.proteinConsumed * N_FRACTION;
  const nitrogenRetained = data.proteinRetained * N_FRACTION;

  return {
    RGR: calculateRGR(data.initialWeight, data.finalWeight, data.days),
    SGR: calculateSGR(data.initialWeight, data.finalWeight, data.days),
    FCR: calculateFCR(data.totalFeedConsumed, weightGain),
    FE: calculateFeedEfficiency(weightGain, data.totalFeedConsumed),
    PER: calculatePER(weightGain, data.proteinConsumed),
    NRE: calculateNRE(nitrogenRetained, nitrogenConsumed),
    LRE: calculateLRE(data.lipidRetained, data.lipidConsumed),
    ERE: calculateERE(data.energyRetained, data.digestibleEnergy),
    TGC: calculateTGC(data.initialWeight, data.finalWeight, data.degreeDays),
    weightGain
  };
}
