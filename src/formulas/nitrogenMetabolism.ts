/**
 * FEEDNETICS Model - Nitrogen Metabolism
 * Equations (A.19) - (A.42)
 *
 * Includes:
 * - Protein Synthesis (A.19 - A.29)
 * - Protein Degradation (A.30 - A.34)
 * - Amino Acid Oxidation (A.35 - A.40)
 * - Gluconeogenesis (A.41 - A.42)
 */

import {
  AminoAcidId,
  ProteinMetabolismParams,
  AAMaintenanceParams,
  GluconeogenesisParams,
  RibosomeState,
  AA_MOLECULAR_WEIGHTS
} from '../types';

// ============================================================================
// 7.1 Protein Synthesis (A.19 - A.29)
// ============================================================================

/**
 * Equation (A.19): Maximum Protein Synthesis Rate
 *
 * max_prot_synth = min(k_RNA × vs_T × C_s × protein_total, lim_prot_synth)
 *
 * @param k_RNA Translation rate
 * @param vs_T Temperature effect on protein synthesis
 * @param C_s Transcription rate (RNA quantity per gram protein)
 * @param proteinTotal Total body protein (g)
 * @param limProtSynth Maximum rate limited by free AA substrate (g/day)
 * @returns Maximum protein synthesis rate (g/day)
 */
export function calculateMaxProteinSynthesis(
  k_RNA: number,
  vs_T: number,
  C_s: number,
  proteinTotal: number,
  limProtSynth: number
): number {
  const ribosomalCapacity = k_RNA * vs_T * C_s * proteinTotal;
  return Math.min(ribosomalCapacity, limProtSynth);
}

/**
 * Equation (A.20): Temperature Effect on Protein Synthesis
 *
 * vs_T = temperature_effect × T
 *
 * @param temperatureEffect Temperature coefficient
 * @param temperature Current temperature (°C)
 * @returns Temperature effect factor
 */
export function calculateTemperatureEffectSynthesis(
  temperatureEffect: number,
  temperature: number
): number {
  return temperatureEffect * temperature;
}

/**
 * Equation (A.21): Ribosome Activation
 *
 * ribo_activation = k_ribo × ribo_occupied × valve_activation
 *
 * @param k_ribo Ribosome rate constant
 * @param riboOccupied Occupied ribosomes
 * @param valveActivation Activation valve
 * @returns Ribosome activation rate
 */
export function calculateRibosomeActivation(
  k_ribo: number,
  riboOccupied: number,
  valveActivation: number
): number {
  return k_ribo * riboOccupied * valveActivation;
}

/**
 * Equation (A.22): Ribosome Deactivation
 *
 * ribo_deactivation = k_ribo × ribo_unoccupied × valve_deactivation
 *
 * @param k_ribo Ribosome rate constant
 * @param riboUnoccupied Unoccupied ribosomes
 * @param valveDeactivation Deactivation valve
 * @returns Ribosome deactivation rate
 */
export function calculateRibosomeDeactivation(
  k_ribo: number,
  riboUnoccupied: number,
  valveDeactivation: number
): number {
  return k_ribo * riboUnoccupied * valveDeactivation;
}

/**
 * Equations (A.23) & (A.24): Ribosome Dynamics
 *
 * d(ribo_occupied)/dt = ribo_deactivation - ribo_activation
 * d(ribo_unoccupied)/dt = ribo_activation - ribo_deactivation
 *
 * @param currentState Current ribosome state
 * @param activation Activation rate
 * @param deactivation Deactivation rate
 * @param dt Time step (days)
 * @returns Updated ribosome state
 */
export function updateRibosomeState(
  currentState: RibosomeState,
  activation: number,
  deactivation: number,
  dt: number
): RibosomeState {
  const dOccupied = deactivation - activation;
  const dUnoccupied = activation - deactivation;

  return {
    occupied: Math.max(0, currentState.occupied + dOccupied * dt),
    unoccupied: Math.max(0, currentState.unoccupied + dUnoccupied * dt)
  };
}

/**
 * Equation (A.25): Ribosome Activity
 *
 * ribo_act = ribo_unoccupied / (ribo_occupied + ribo_unoccupied)
 *
 * @param riboState Ribosome state
 * @returns Ribosome activity [0, 1]
 */
export function calculateRibosomeActivity(riboState: RibosomeState): number {
  const total = riboState.occupied + riboState.unoccupied;
  if (total <= 0) return 0.5;
  return riboState.unoccupied / total;
}

/**
 * Equation (A.26): Translation Rate (k_RNA)
 *
 * k_RNA = e^[(1-ribo_act) × ln(k_RNA_min) + ribo_act × ln(k_RNA_max)]
 *
 * Logarithmic interpolation between min and max translation rates
 *
 * @param riboAct Ribosome activity [0, 1]
 * @param k_RNA_min Minimum translation rate
 * @param k_RNA_max Maximum translation rate
 * @returns Translation rate
 */
export function calculateTranslationRate(
  riboAct: number,
  k_RNA_min: number,
  k_RNA_max: number
): number {
  const logMin = Math.log(Math.max(k_RNA_min, 1e-10));
  const logMax = Math.log(Math.max(k_RNA_max, 1e-10));
  const logK = (1 - riboAct) * logMin + riboAct * logMax;
  return Math.exp(logK);
}

/**
 * Equation (A.27): Protein Synthesis Regulator
 *
 * prot_synt_regulator = 0.05 + 0.95 × min(1, max(0, CL_q + fed - starving))
 *
 * Combines lipid status, feeding state, and starvation
 *
 * @param CL_q Crude lipids control variable
 * @param fed Fed state [0, 1]
 * @param starving Starvation indicator
 * @returns Synthesis regulator [0.05, 1]
 */
export function calculateProteinSynthesisRegulator(
  CL_q: number,
  fed: number,
  starving: number
): number {
  const combined = CL_q + fed - starving;
  const clamped = Math.min(1, Math.max(0, combined));
  return 0.05 + 0.95 * clamped;
}

/**
 * Equation (A.28): Amino Acid Synthesis Valve
 *
 * AA_synt_valv = min(1 / (1 + 1/(AA_free/ref_AA_free)^AA_synt_beta))
 *
 * Sigmoid valve based on free AA availability
 *
 * @param AA_free Total free amino acids (g)
 * @param ref_AA_free Reference free AA level (g)
 * @param AA_synt_beta Shape parameter
 * @returns Synthesis valve [0, 1]
 */
export function calculateAASynthesisValve(
  AA_free: number,
  ref_AA_free: number,
  AA_synt_beta: number
): number {
  if (AA_free <= 0 || ref_AA_free <= 0) return 0;

  const ratio = AA_free / ref_AA_free;
  const denominator = 1 + 1 / Math.pow(ratio, AA_synt_beta);
  return Math.min(1, 1 / denominator);
}

/**
 * Equation (A.29): Actual Protein Synthesis Rate
 *
 * A_prot_synth = max_prot_synth × prot_synt_regulator × AA_synt_valv
 *
 * @param maxProtSynth Maximum protein synthesis (g/day)
 * @param protSyntRegulator Synthesis regulator
 * @param AASyntValv AA synthesis valve
 * @returns Actual protein synthesis rate (g/day)
 */
export function calculateActualProteinSynthesis(
  maxProtSynth: number,
  protSyntRegulator: number,
  AASyntValv: number
): number {
  return maxProtSynth * protSyntRegulator * AASyntValv;
}

// ============================================================================
// 7.2 Protein Degradation (A.30 - A.34)
// ============================================================================

/**
 * Equation (A.30): Maximum Protein Degradation
 *
 * max_prot_deg = k_deg × deg_temp_factor × protein_total
 *
 * @param k_deg Degradation rate constant
 * @param degTempFactor Temperature effect on degradation
 * @param proteinTotal Total body protein (g)
 * @returns Maximum protein degradation rate (g/day)
 */
export function calculateMaxProteinDegradation(
  k_deg: number,
  degTempFactor: number,
  proteinTotal: number
): number {
  return k_deg * degTempFactor * proteinTotal;
}

/**
 * Equation (A.31): Temperature Effect on Degradation
 *
 * deg_temp_factor = V_db + V_dm × (temperature - T_optimal)²
 *
 * U-shaped temperature effect (minimum at optimal temperature)
 *
 * @param V_db Baseline degradation parameter
 * @param V_dm Temperature sensitivity parameter
 * @param temperature Current temperature (°C)
 * @param T_optimal Optimal temperature (°C)
 * @returns Temperature effect factor
 */
export function calculateDegradationTempFactor(
  V_db: number,
  V_dm: number,
  temperature: number,
  T_optimal: number
): number {
  const tempDiff = temperature - T_optimal;
  return V_db + V_dm * tempDiff * tempDiff;
}

/**
 * Equation (A.32): Minimum Protein Degradation
 *
 * min_prot_deg = prot_deg_min_factor × min_AA_loss
 *
 * @param protDegMinFactor Minimum degradation factor
 * @param minAALoss Minimum AA loss for maintenance (g/day)
 * @returns Minimum protein degradation (g/day)
 */
export function calculateMinProteinDegradation(
  protDegMinFactor: number,
  minAALoss: number
): number {
  return protDegMinFactor * minAALoss;
}

/**
 * Equation (A.33): Amino Acid Degradation Valve
 *
 * AA_deg_valv = min(1 / (1 + (AA_free/ref_AA_free)^AA_deg_beta_2))^AA_deg_beta_1
 *
 * Inverse sigmoid: high free AA = low degradation
 *
 * @param AA_free Total free amino acids (g)
 * @param ref_AA_free Reference free AA level (g)
 * @param AA_deg_beta_1 Outer shape parameter
 * @param AA_deg_beta_2 Inner shape parameter
 * @returns Degradation valve [0, 1]
 */
export function calculateAADegradationValve(
  AA_free: number,
  ref_AA_free: number,
  AA_deg_beta_1: number,
  AA_deg_beta_2: number
): number {
  if (ref_AA_free <= 0) return 1;

  const ratio = AA_free / ref_AA_free;
  const inner = 1 / (1 + Math.pow(ratio, AA_deg_beta_2));
  return Math.min(1, Math.pow(inner, AA_deg_beta_1));
}

/**
 * Equation (A.34): Actual Protein Degradation
 *
 * prot_deg = min_prot_deg + (max_prot_deg - min_prot_deg) × AA_deg_valv
 *
 * @param minProtDeg Minimum protein degradation (g/day)
 * @param maxProtDeg Maximum protein degradation (g/day)
 * @param AADegValv AA degradation valve
 * @returns Actual protein degradation rate (g/day)
 */
export function calculateActualProteinDegradation(
  minProtDeg: number,
  maxProtDeg: number,
  AADegValv: number
): number {
  return minProtDeg + (maxProtDeg - minProtDeg) * AADegValv;
}

// ============================================================================
// 7.3 Amino Acid Oxidation (A.35 - A.40)
// ============================================================================

/**
 * Equation (A.35): Minimum Amino Acid Loss (Fasting Maintenance)
 *
 * min_AA_loss = req_prot_a × e^(req_prot_b × temperature) × (bw/1000)^req_prot_c
 *
 * @param bodyWeight Body weight (g)
 * @param temperature Temperature (°C)
 * @param params AA maintenance parameters
 * @returns Minimum AA loss (g/day)
 */
export function calculateMinAALoss(
  bodyWeight: number,
  temperature: number,
  params: AAMaintenanceParams
): number {
  const { req_prot_a, req_prot_b, req_prot_c } = params;
  return req_prot_a *
    Math.exp(req_prot_b * temperature) *
    Math.pow(bodyWeight / 1000, req_prot_c);
}

/**
 * Equation (A.36): Normalized Free AA (Max Reference)
 *
 * AA_free_max_norm = AA_free / max_ref_AA_free
 *
 * @param AA_free Free amino acid amount (mol)
 * @param max_ref_AA_free Maximum reference level (mol)
 * @returns Normalized value
 */
export function normalizeAAFreeMax(
  AA_free: number,
  max_ref_AA_free: number
): number {
  if (max_ref_AA_free <= 0) return 0;
  return AA_free / max_ref_AA_free;
}

/**
 * Equation (A.37): Normalized Free AA (Min Reference)
 *
 * AA_free_min_norm = AA_free / min_ref_AA_free
 *
 * @param AA_free Free amino acid amount (mol)
 * @param min_ref_AA_free Minimum reference level (mol)
 * @returns Normalized value
 */
export function normalizeAAFreeMin(
  AA_free: number,
  min_ref_AA_free: number
): number {
  if (min_ref_AA_free <= 0) return 0;
  return AA_free / min_ref_AA_free;
}

/**
 * Equation (A.38): Amino Acid Oxidation Valve
 *
 * AA_ox_valv = min(AA_free_max_norm/Σ, AA_free_min_norm/Σ)
 *
 * Determines which AA to oxidize based on excess above reference
 *
 * @param freeAA Free amino acids by type (mol)
 * @param maxRef Maximum reference levels (mol)
 * @param minRef Minimum reference levels (mol)
 * @returns Oxidation valve for each AA
 */
export function calculateAAOxidationValve(
  freeAA: Record<AminoAcidId, number>,
  maxRef: Record<AminoAcidId, number>,
  minRef: Record<AminoAcidId, number>
): Record<AminoAcidId, number> {
  const valves = {} as Record<AminoAcidId, number>;

  // Calculate normalized values
  let sumMaxNorm = 0;
  let sumMinNorm = 0;
  const maxNorms: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;
  const minNorms: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;

  for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
    maxNorms[aa] = normalizeAAFreeMax(freeAA[aa] || 0, maxRef[aa] || 1);
    minNorms[aa] = normalizeAAFreeMin(freeAA[aa] || 0, minRef[aa] || 1);
    sumMaxNorm += maxNorms[aa];
    sumMinNorm += minNorms[aa];
  }

  // Calculate valve for each AA
  for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
    const maxFrac = sumMaxNorm > 0 ? maxNorms[aa] / sumMaxNorm : 0;
    const minFrac = sumMinNorm > 0 ? minNorms[aa] / sumMinNorm : 0;
    valves[aa] = Math.min(maxFrac, minFrac);
  }

  return valves;
}

/**
 * Equation (A.39): Oxidation Weights
 *
 * AA_ox_weights = AA_ox_valv / Σ AA_ox_valv
 *
 * Normalizes oxidation valves to sum to 1
 *
 * @param valves Oxidation valves
 * @returns Normalized weights
 */
export function calculateAAOxidationWeights(
  valves: Record<AminoAcidId, number>
): Record<AminoAcidId, number> {
  const sum = Object.values(valves).reduce((s, v) => s + v, 0);
  const weights = {} as Record<AminoAcidId, number>;

  for (const aa of Object.keys(valves) as AminoAcidId[]) {
    weights[aa] = sum > 0 ? valves[aa] / sum : 1 / Object.keys(valves).length;
  }

  return weights;
}

/**
 * Equation (A.40): Amino Acid Oxidation Rate
 *
 * AA_ox_rate = AA_ox_weights × m_ox_AA
 *
 * @param weights Oxidation weights by AA
 * @param m_ox_AA Total AA to oxidize (g/day)
 * @returns Oxidation rate for each AA (g/day)
 */
export function calculateAAOxidationRate(
  weights: Record<AminoAcidId, number>,
  m_ox_AA: number
): Record<AminoAcidId, number> {
  const rates = {} as Record<AminoAcidId, number>;

  for (const aa of Object.keys(weights) as AminoAcidId[]) {
    rates[aa] = weights[aa] * m_ox_AA;
  }

  return rates;
}

// ============================================================================
// 7.4 Gluconeogenesis (A.41 - A.42)
// ============================================================================

/** Stoichiometry: mol glucose produced per mol of glucogenic AA */
export const GLUCONEOGENESIS_STOICH: Partial<Record<AminoAcidId, number>> = {
  Ala: 0.5,   // Pyruvate pathway
  Arg: 0.5,
  Asn: 0.5,
  Asp: 0.5,
  Cys: 0.5,
  Gln: 0.5,
  Glu: 0.5,
  Gly: 0.5,
  His: 0.5,
  Ile: 0.25,  // Partially ketogenic
  Met: 0.5,
  Phe: 0.25,  // Partially ketogenic
  Pro: 0.5,
  Ser: 0.5,
  Thr: 0.5,
  Trp: 0.25,  // Partially ketogenic
  Tyr: 0.25,  // Partially ketogenic
  Val: 0.5
  // Leu: purely ketogenic, not included
  // Lys: purely ketogenic, not included
};

/**
 * Calculate glucogenic weights based on AA availability
 *
 * @param freeAA Free amino acids (mol)
 * @returns Weights for gluconeogenesis
 */
export function calculateGluconeogenesisWeights(
  freeAA: Record<AminoAcidId, number>
): Record<AminoAcidId, number> {
  const weights = {} as Record<AminoAcidId, number>;
  let sum = 0;

  for (const aa of Object.keys(GLUCONEOGENESIS_STOICH) as AminoAcidId[]) {
    const stoich = GLUCONEOGENESIS_STOICH[aa] || 0;
    const available = freeAA[aa] || 0;
    weights[aa] = available * stoich;
    sum += weights[aa];
  }

  // Normalize
  for (const aa of Object.keys(weights) as AminoAcidId[]) {
    weights[aa] = sum > 0 ? weights[aa] / sum : 0;
  }

  return weights;
}

/**
 * Equation (A.41): Maximum Gluconeogenesis Rate
 *
 * V_max_gluconeo = min(
 *   AA_gluco_weights × stoich × a_gluconeo × bw × e^(b×T),
 *   stoich × AA_free / timestep
 * )
 *
 * @param freeAA Free amino acids (mol)
 * @param bodyWeight Body weight (g)
 * @param temperature Temperature (°C)
 * @param timestep Time step (days)
 * @param params Gluconeogenesis parameters
 * @returns Maximum gluconeogenesis rate (mol glucose/day)
 */
export function calculateMaxGluconeogenesis(
  freeAA: Record<AminoAcidId, number>,
  bodyWeight: number,
  temperature: number,
  timestep: number,
  params: GluconeogenesisParams
): number {
  const { a_gluconeo, b } = params;
  const weights = calculateGluconeogenesisWeights(freeAA);

  // Calculate potential glucose from each AA
  let enzymeCapacity = 0;
  let substrateLimit = 0;

  for (const aa of Object.keys(GLUCONEOGENESIS_STOICH) as AminoAcidId[]) {
    const stoich = GLUCONEOGENESIS_STOICH[aa] || 0;
    const weight = weights[aa] || 0;
    const available = freeAA[aa] || 0;

    enzymeCapacity += weight * stoich * a_gluconeo * bodyWeight * Math.exp(b * temperature);
    substrateLimit += stoich * available / timestep;
  }

  return Math.min(enzymeCapacity, substrateLimit);
}

/**
 * Equation (A.42): Actual Gluconeogenesis Rate
 *
 * V_gluconeo = V_max_gluconeo × [1 / (1 + glucose/ref_glucose)] × AA_gluco_weights
 *
 * Inhibited by high glucose (feedback)
 *
 * @param V_max_gluconeo Maximum rate (mol/day)
 * @param glucose Current glucose level (mol)
 * @param ref_glucose Reference glucose level (mol)
 * @returns Actual gluconeogenesis rate (mol glucose/day)
 */
export function calculateActualGluconeogenesis(
  V_max_gluconeo: number,
  glucose: number,
  ref_glucose: number
): number {
  if (ref_glucose <= 0) return V_max_gluconeo;

  const inhibition = 1 / (1 + glucose / ref_glucose);
  return V_max_gluconeo * inhibition;
}

// ============================================================================
// 7.5 Non-Essential Amino Acid Synthesis
// ============================================================================

/**
 * Non-essential AA can be synthesized from glucose as carbon source
 * Nitrogen balance constraint: N incorporated ≤ N lost during timestep
 *
 * Special conversions:
 * - Methionine → Cysteine
 * - Phenylalanine → Tyrosine
 */
export const NEAA_SYNTHESIS_STOICH: Record<string, { glucoseMol: number; nitrogenMol: number }> = {
  Ala: { glucoseMol: 0.5, nitrogenMol: 1 },
  Asn: { glucoseMol: 0.67, nitrogenMol: 2 },
  Asp: { glucoseMol: 0.67, nitrogenMol: 1 },
  Gln: { glucoseMol: 0.83, nitrogenMol: 2 },
  Glu: { glucoseMol: 0.83, nitrogenMol: 1 },
  Gly: { glucoseMol: 0.33, nitrogenMol: 1 },
  Pro: { glucoseMol: 0.83, nitrogenMol: 1 },
  Ser: { glucoseMol: 0.5, nitrogenMol: 1 },
};

/**
 * Calculate NEAA synthesis rates
 *
 * @param glucoseAvailable Available glucose (mol)
 * @param nitrogenAvailable Available nitrogen from AA oxidation (mol N)
 * @param demand Demand for each NEAA (mol)
 * @returns Synthesis rates (mol/day)
 */
export function calculateNEAASynthesis(
  glucoseAvailable: number,
  nitrogenAvailable: number,
  demand: Record<string, number>
): Record<string, number> {
  const synthesis: Record<string, number> = {};
  let remainingGlucose = glucoseAvailable;
  let remainingNitrogen = nitrogenAvailable;

  for (const aa of Object.keys(demand)) {
    if (!NEAA_SYNTHESIS_STOICH[aa]) {
      synthesis[aa] = 0;
      continue;
    }

    const stoich = NEAA_SYNTHESIS_STOICH[aa];
    const demandMol = demand[aa] || 0;

    // Limit by substrate availability
    const glucoseLimit = remainingGlucose / stoich.glucoseMol;
    const nitrogenLimit = remainingNitrogen / stoich.nitrogenMol;
    const synthesized = Math.min(demandMol, glucoseLimit, nitrogenLimit);

    synthesis[aa] = Math.max(0, synthesized);
    remainingGlucose -= synthesized * stoich.glucoseMol;
    remainingNitrogen -= synthesized * stoich.nitrogenMol;
  }

  return synthesis;
}

/**
 * Methionine → Cysteine conversion
 *
 * @param methionineAvailable Available methionine (mol)
 * @param cysteineDemand Demand for cysteine (mol)
 * @returns Cysteine synthesized (mol)
 */
export function methionineToCysteine(
  methionineAvailable: number,
  cysteineDemand: number
): number {
  return Math.min(methionineAvailable, cysteineDemand);
}

/**
 * Phenylalanine → Tyrosine conversion
 *
 * @param phenylalanineAvailable Available phenylalanine (mol)
 * @param tyrosineDemand Demand for tyrosine (mol)
 * @returns Tyrosine synthesized (mol)
 */
export function phenylalanineToTyrosine(
  phenylalanineAvailable: number,
  tyrosineDemand: number
): number {
  return Math.min(phenylalanineAvailable, tyrosineDemand);
}
