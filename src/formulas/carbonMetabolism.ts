/**
 * FEEDNETICS Model - Carbon Metabolism
 * Equations (A.43) - (A.46)
 *
 * This module handles:
 * - Glucose oxidation
 * - Glycogenesis and Glycogenolysis
 * - Lipogenesis
 * - Beta-oxidation of fatty acids
 */

import { FattyAcidId, GlucoseOxidationParams, LipogenesisParams } from '../types';

/** Parameters for glycogen metabolism */
export interface GlycogenParams {
  k_glycogen: number; // Rate constant for glycogen turnover
}

/**
 * Equation (A.43): Maximum Glucose Oxidation Rate
 *
 * V_max_glucox = min(a_glucox × BW × e^(b × T), glucose / timestep)
 *
 * Glucose oxidation is limited by either:
 * 1. Enzymatic capacity (temperature-dependent)
 * 2. Available substrate (glucose pool)
 *
 * @param bodyWeight Body weight (g)
 * @param temperature Temperature (°C)
 * @param glucose Available glucose (mol)
 * @param timestep Time step (days)
 * @param params Glucose oxidation parameters
 * @returns Maximum glucose oxidation rate (mol/day)
 */
export function calculateMaxGlucoseOxidation(
  bodyWeight: number,
  temperature: number,
  glucose: number,
  timestep: number,
  params: GlucoseOxidationParams
): number {
  // Enzymatic capacity
  const enzymaticCapacity = params.a_glucox * bodyWeight * Math.exp(params.b * temperature);

  // Substrate limitation
  const substrateLimit = timestep > 0 ? glucose / timestep : 0;

  return Math.min(enzymaticCapacity, substrateLimit);
}

/**
 * Calculate actual glucose oxidation based on ATP demand
 *
 * The actual glucose oxidation depends on ATP requirements
 * after accounting for other oxidation pathways
 *
 * @param V_max_glucox Maximum glucose oxidation rate (mol/day)
 * @param ATP_demand ATP demand from glucose oxidation (mol/day)
 * @param ATP_per_glucose ATP yield per glucose (~32 mol ATP/mol glucose)
 * @returns Actual glucose oxidation rate (mol/day)
 */
export function calculateActualGlucoseOxidation(
  V_max_glucox: number,
  ATP_demand: number,
  ATP_per_glucose: number = 32
): number {
  // Required glucose to meet ATP demand
  const requiredGlucose = ATP_per_glucose > 0 ? ATP_demand / ATP_per_glucose : 0;

  return Math.min(V_max_glucox, Math.max(0, requiredGlucose));
}

/**
 * Equation (A.44): Maximum Glycogen Turnover Rate
 *
 * V_max_glycogen = constant × protein_total
 *
 * Glycogen storage capacity scales with body protein (lean mass proxy)
 *
 * @param proteinTotal Total body protein (g)
 * @param k_glycogen Glycogen rate constant
 * @returns Maximum glycogen turnover rate (mol/day)
 */
export function calculateMaxGlycogenTurnover(
  proteinTotal: number,
  k_glycogen: number
): number {
  return k_glycogen * proteinTotal;
}

/**
 * Calculate glycogenesis rate (glucose → glycogen)
 *
 * Glycogenesis occurs when glucose is in excess and glycogen stores are below capacity
 *
 * @param V_max_glycogen Maximum glycogen turnover rate (mol/day)
 * @param glucose Current glucose pool (mol)
 * @param glycogen Current glycogen pool (mol)
 * @param glycogenRef Reference glycogen level (mol)
 * @param beta Shape parameter
 * @returns Glycogenesis rate (mol glucose/day)
 */
export function calculateGlycogenesis(
  V_max_glycogen: number,
  glucose: number,
  glycogen: number,
  glycogenRef: number,
  beta: number = 2
): number {
  if (glucose <= 0 || glycogenRef <= 0) return 0;

  // Glycogenesis increases when glycogen is below reference
  // Uses sigmoid function for smooth transition
  const glycogenRatio = glycogen / glycogenRef;
  const glycogenesisValve = 1 / (1 + Math.pow(glycogenRatio, beta));

  // Also depends on glucose availability
  const glucoseValve = glucose / (glucose + glycogenRef * 0.1);

  return V_max_glycogen * glycogenesisValve * glucoseValve;
}

/**
 * Calculate glycogenolysis rate (glycogen → glucose)
 *
 * Glycogenolysis occurs when glucose is low and glycogen stores are available
 *
 * @param V_max_glycogen Maximum glycogen turnover rate (mol/day)
 * @param glucose Current glucose pool (mol)
 * @param glycogen Current glycogen pool (mol)
 * @param glucoseRef Reference glucose level (mol)
 * @param beta Shape parameter
 * @returns Glycogenolysis rate (mol glucose/day)
 */
export function calculateGlycogenolysis(
  V_max_glycogen: number,
  glucose: number,
  glycogen: number,
  glucoseRef: number,
  beta: number = 2
): number {
  if (glycogen <= 0 || glucoseRef <= 0) return 0;

  // Glycogenolysis increases when glucose is below reference
  const glucoseRatio = glucose / glucoseRef;
  const glycogenolysisValve = 1 / (1 + Math.pow(glucoseRatio, beta));

  // Limited by available glycogen
  const glycogenFraction = glycogen / (glycogen + glucoseRef);

  return V_max_glycogen * glycogenolysisValve * glycogenFraction;
}

/**
 * Net glycogen flux (positive = storage, negative = mobilization)
 *
 * @param glycogenesis Glycogenesis rate (mol/day)
 * @param glycogenolysis Glycogenolysis rate (mol/day)
 * @returns Net glycogen flux (mol/day)
 */
export function calculateNetGlycogenFlux(
  glycogenesis: number,
  glycogenolysis: number
): number {
  return glycogenesis - glycogenolysis;
}

/**
 * Equation (A.45): Maximum Lipogenesis Rate
 *
 * V_max_lipogen = min(a_lipogen × BW × e^(b × T), glucose / timestep)
 *
 * De novo lipogenesis from glucose (fatty acid synthesis)
 *
 * @param bodyWeight Body weight (g)
 * @param temperature Temperature (°C)
 * @param glucose Available glucose (mol)
 * @param timestep Time step (days)
 * @param params Lipogenesis parameters
 * @returns Maximum lipogenesis rate (mol glucose/day)
 */
export function calculateMaxLipogenesis(
  bodyWeight: number,
  temperature: number,
  glucose: number,
  timestep: number,
  params: LipogenesisParams
): number {
  // Enzymatic capacity
  const enzymaticCapacity = params.a_lipogen * bodyWeight * Math.exp(params.b * temperature);

  // Substrate limitation
  const substrateLimit = timestep > 0 ? glucose / timestep : 0;

  return Math.min(enzymaticCapacity, substrateLimit);
}

/**
 * Calculate actual lipogenesis rate
 *
 * Lipogenesis is controlled by:
 * - CL_q (lipid status) - decreases when lipid stores are high
 * - Glucose availability
 * - Fed state
 *
 * @param V_max_lipogen Maximum lipogenesis rate (mol/day)
 * @param CL_q Crude lipids control variable [0,1]
 * @param fedState Fed state [0=fasted, 1=fed]
 * @returns Actual lipogenesis rate (mol glucose/day)
 */
export function calculateActualLipogenesis(
  V_max_lipogen: number,
  CL_q: number,
  fedState: number
): number {
  // Lipogenesis is enhanced when CL_q is low (need more lipid)
  // and when fed (excess energy available)
  const lipogenesisValve = (1 - CL_q) * fedState;

  return V_max_lipogen * lipogenesisValve;
}

/**
 * Stoichiometry: Glucose to Palmitate (C16:0)
 *
 * Simplified stoichiometry: ~4 glucose → 1 palmitate
 * (8 acetyl-CoA needed, each glucose yields 2 acetyl-CoA)
 */
export const GLUCOSE_PER_PALMITATE = 4;

/**
 * Convert lipogenesis glucose consumption to fatty acid production
 *
 * @param glucoseConsumed Glucose consumed in lipogenesis (mol/day)
 * @returns Fatty acid (palmitate) produced (mol/day)
 */
export function calculateFAFromLipogenesis(
  glucoseConsumed: number
): number {
  return glucoseConsumed / GLUCOSE_PER_PALMITATE;
}

/**
 * Equation (A.46): Fatty Acid Beta-Oxidation
 *
 * TAG_betox = TAG_ox_weights × m_ox_FA
 *
 * Distributes total FA oxidation across fatty acid types
 *
 * @param TAG_weights Oxidation weights for each FA type
 * @param m_ox_FA Total mass of FA to oxidize (g/day)
 * @returns Oxidation rate for each FA type (g/day)
 */
export function calculateFABetaOxidation(
  TAG_weights: Record<FattyAcidId, number>,
  m_ox_FA: number
): Record<FattyAcidId, number> {
  const result: Record<FattyAcidId, number> = {};

  for (const fa of Object.keys(TAG_weights)) {
    const weight = TAG_weights[fa] || 0;
    result[fa] = weight * m_ox_FA;
  }

  return result;
}

/**
 * Calculate FA oxidation weights based on availability
 *
 * Weights are proportional to the amount of each FA in body stores
 *
 * @param TAG_body Body TAG by fatty acid (mol)
 * @returns Normalized weights for each FA
 */
export function calculateFAOxidationWeights(
  TAG_body: Record<FattyAcidId, number>
): Record<FattyAcidId, number> {
  const weights: Record<FattyAcidId, number> = {};
  let total = 0;

  // Sum all FA amounts
  for (const fa of Object.keys(TAG_body)) {
    const amount = TAG_body[fa] || 0;
    total += amount;
  }

  // Normalize to get weights
  for (const fa of Object.keys(TAG_body)) {
    weights[fa] = total > 0 ? (TAG_body[fa] || 0) / total : 0;
  }

  return weights;
}

/**
 * Complete carbon metabolism calculation
 *
 * Integrates glucose oxidation, glycogen metabolism, lipogenesis,
 * and beta-oxidation
 */
export function calculateCarbonMetabolism(
  bodyWeight: number,
  temperature: number,
  glucose: number,
  glycogen: number,
  proteinTotal: number,
  TAG_body: Record<FattyAcidId, number>,
  CL_q: number,
  fedState: number,
  m_ox_FA: number,
  timestep: number,
  glucoxParams: GlucoseOxidationParams,
  lipogenParams: LipogenesisParams,
  glycogenParams: GlycogenParams,
  glucoseRef: number,
  glycogenRef: number
): {
  V_glucox: number;
  glycogenesis: number;
  glycogenolysis: number;
  netGlycogenFlux: number;
  lipogenesis: number;
  FA_produced: number;
  FA_oxidized: Record<FattyAcidId, number>;
} {
  // Maximum glucose oxidation (A.43)
  const V_max_glucox = calculateMaxGlucoseOxidation(
    bodyWeight, temperature, glucose, timestep, glucoxParams
  );

  // For simplicity, assume glucose oxidation is at maximum when glucose is abundant
  const V_glucox = calculateActualGlucoseOxidation(
    V_max_glucox,
    V_max_glucox * 32, // ATP demand at full capacity
    32
  );

  // Glycogen metabolism (A.44)
  const V_max_glycogen = calculateMaxGlycogenTurnover(proteinTotal, glycogenParams.k_glycogen);
  const glycogenesis = calculateGlycogenesis(V_max_glycogen, glucose, glycogen, glycogenRef);
  const glycogenolysis = calculateGlycogenolysis(V_max_glycogen, glucose, glycogen, glucoseRef);
  const netGlycogenFlux = calculateNetGlycogenFlux(glycogenesis, glycogenolysis);

  // Lipogenesis (A.45)
  const V_max_lipogen = calculateMaxLipogenesis(
    bodyWeight, temperature, glucose, timestep, lipogenParams
  );
  const lipogenesis = calculateActualLipogenesis(V_max_lipogen, CL_q, fedState);
  const FA_produced = calculateFAFromLipogenesis(lipogenesis);

  // Beta-oxidation (A.46)
  const TAG_weights = calculateFAOxidationWeights(TAG_body);
  const FA_oxidized = calculateFABetaOxidation(TAG_weights, m_ox_FA);

  return {
    V_glucox,
    glycogenesis,
    glycogenolysis,
    netGlycogenFlux,
    lipogenesis,
    FA_produced,
    FA_oxidized
  };
}

/**
 * ATP production from glucose oxidation
 *
 * Complete oxidation: C6H12O6 + 6O2 → 6CO2 + 6H2O
 * Net yield: ~32 ATP per glucose (via glycolysis + TCA + oxidative phosphorylation)
 */
export const ATP_PER_GLUCOSE = 32;

/**
 * Calculate ATP produced from glucose oxidation
 *
 * @param glucoseOxidized Glucose oxidized (mol/day)
 * @returns ATP produced (mol/day)
 */
export function calculateATPFromGlucose(glucoseOxidized: number): number {
  return glucoseOxidized * ATP_PER_GLUCOSE;
}
