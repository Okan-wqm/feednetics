/**
 * FEEDNETICS Model - Body Weight and Composition
 * Equations (A.9) - (A.11)
 */

import { AminoAcidId, FattyAcidId, BodyComposition, AA_MOLECULAR_WEIGHTS } from '../types';

/** Fatty acid molecular weights (g/mol) - common fatty acids */
export const FA_MOLECULAR_WEIGHTS: Record<string, number> = {
  'C14:0': 228.37,   // Myristic acid
  'C16:0': 256.42,   // Palmitic acid
  'C16:1': 254.41,   // Palmitoleic acid
  'C18:0': 284.48,   // Stearic acid
  'C18:1': 282.46,   // Oleic acid
  'C18:2': 280.45,   // Linoleic acid
  'C18:3': 278.43,   // Linolenic acid
  'C20:4': 304.47,   // Arachidonic acid
  'C20:5': 302.45,   // EPA
  'C22:6': 328.49,   // DHA
};

/**
 * Equation (A.9): Total Protein (Amino Acid Equivalents)
 *
 * protein_total = Σ(i=1 to 20) protein_AA_i × AA_Mw_i
 *
 * @param proteinAA Protein pool by amino acid (mol)
 * @returns Total protein mass (g)
 */
export function calculateTotalProtein(
  proteinAA: Record<AminoAcidId, number>
): number {
  let total = 0;
  for (const aa of Object.keys(proteinAA) as AminoAcidId[]) {
    const moles = proteinAA[aa] || 0;
    const mw = AA_MOLECULAR_WEIGHTS[aa] || 110; // Default MW if not found
    total += moles * mw;
  }
  return total;
}

/**
 * Equation (A.10): Total Lipids
 *
 * lipid_total = Σ(i=1 to 20) (TAG_body_FA_i + TAG_blood_FA_i) × FA_Mw_i
 *
 * @param TAG_body Body TAG by fatty acid (mol)
 * @param TAG_blood Blood TAG by fatty acid (mol)
 * @returns Total lipid mass (g)
 */
export function calculateTotalLipid(
  TAG_body: Record<FattyAcidId, number>,
  TAG_blood: Record<FattyAcidId, number>
): number {
  let total = 0;
  const allFAs = new Set([...Object.keys(TAG_body), ...Object.keys(TAG_blood)]);

  for (const fa of allFAs) {
    const bodyMoles = TAG_body[fa] || 0;
    const bloodMoles = TAG_blood[fa] || 0;
    const mw = FA_MOLECULAR_WEIGHTS[fa] || 280; // Default MW if not found
    total += (bodyMoles + bloodMoles) * mw;
  }
  return total;
}

/**
 * Equation (A.11): Crude Lipids Control Variable (CL_q)
 *
 * CL_q = 1 / (1 + (lipid_ref / lipid_total)^β)
 *
 * This is a sigmoid function that controls the balance between
 * amino acid and fatty acid oxidation based on body lipid status
 *
 * @param lipidTotal Current total lipid (g)
 * @param lipidRef Reference lipid level (g)
 * @param beta Shape parameter
 * @returns CL_q value [0, 1]
 */
export function calculateCL_q(
  lipidTotal: number,
  lipidRef: number,
  beta: number
): number {
  if (lipidTotal <= 0) return 0;
  if (lipidRef <= 0) return 1;

  const ratio = lipidRef / lipidTotal;
  return 1 / (1 + Math.pow(ratio, beta));
}

/**
 * Calculate reference lipid level based on fasting state
 * Interpolates between min and max reference values
 *
 * @param lipidRefMin Minimum reference lipid (fed state)
 * @param lipidRefMax Maximum reference lipid (fasted state)
 * @param fastingState Fasting state [0=fed, 1=fasted]
 * @returns Interpolated reference lipid level
 */
export function calculateLipidRef(
  lipidRefMin: number,
  lipidRefMax: number,
  fastingState: number
): number {
  return lipidRefMin + (lipidRefMax - lipidRefMin) * fastingState;
}

/**
 * Calculate total body weight from composition
 *
 * BW = protein + lipid + glycogen + water + ash + other
 *
 * @param composition Body composition
 * @param waterFraction Water as fraction of lean mass (~0.7)
 * @param ashFraction Ash as fraction of body weight (~0.03)
 * @returns Total body weight (g)
 */
export function calculateBodyWeight(
  composition: BodyComposition,
  waterFraction: number = 0.7,
  ashFraction: number = 0.03
): number {
  const protein = calculateTotalProtein(composition.proteinAA);
  const lipid = calculateTotalLipid(composition.TAG_body, composition.TAG_blood);

  // Glycogen (MW ~162 g/mol for glucose units)
  const glycogen = composition.glycogen * 162;

  // Lean mass = protein + glycogen
  const leanMass = protein + glycogen;

  // Water based on lean mass
  const water = leanMass * waterFraction;

  // Ash based on total mass (iterative calculation)
  // Simplified: ash ≈ 3% of final weight
  const dryMass = protein + lipid + glycogen;
  const totalWithWater = dryMass + water;
  const ash = totalWithWater * ashFraction / (1 - ashFraction);

  return protein + lipid + glycogen + water + ash;
}

/**
 * Calculate crude protein percentage
 *
 * @param composition Body composition
 * @param bodyWeight Total body weight (g)
 * @returns Crude protein (% of body weight)
 */
export function calculateCrudeProteinPercent(
  composition: BodyComposition,
  bodyWeight: number
): number {
  const protein = calculateTotalProtein(composition.proteinAA);
  return (protein / bodyWeight) * 100;
}

/**
 * Calculate crude lipid percentage
 *
 * @param composition Body composition
 * @param bodyWeight Total body weight (g)
 * @returns Crude lipid (% of body weight)
 */
export function calculateCrudeLipidPercent(
  composition: BodyComposition,
  bodyWeight: number
): number {
  const lipid = calculateTotalLipid(composition.TAG_body, composition.TAG_blood);
  return (lipid / bodyWeight) * 100;
}

/**
 * Calculate total free amino acids
 *
 * @param freeAA Free amino acids (mol)
 * @returns Total free AA mass (g)
 */
export function calculateTotalFreeAA(
  freeAA: Record<AminoAcidId, number>
): number {
  let total = 0;
  for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
    const moles = freeAA[aa] || 0;
    const mw = AA_MOLECULAR_WEIGHTS[aa] || 110;
    total += moles * mw;
  }
  return total;
}

/**
 * Get amino acid profile from body protein
 *
 * @param proteinAA Protein pool by amino acid (mol)
 * @returns Profile as percentage of total protein
 */
export function getAAProfile(
  proteinAA: Record<AminoAcidId, number>
): Record<AminoAcidId, number> {
  const total = Object.values(proteinAA).reduce((sum, val) => sum + val, 0);
  const profile = {} as Record<AminoAcidId, number>;

  for (const aa of Object.keys(proteinAA) as AminoAcidId[]) {
    profile[aa] = total > 0 ? (proteinAA[aa] / total) * 100 : 0;
  }
  return profile;
}

/**
 * Get fatty acid profile from body lipids
 *
 * @param TAG_body Body TAG by fatty acid (mol)
 * @param TAG_blood Blood TAG by fatty acid (mol)
 * @returns Profile as percentage of total lipid
 */
export function getFAProfile(
  TAG_body: Record<FattyAcidId, number>,
  TAG_blood: Record<FattyAcidId, number>
): Record<FattyAcidId, number> {
  const combined: Record<FattyAcidId, number> = {};
  const allFAs = new Set([...Object.keys(TAG_body), ...Object.keys(TAG_blood)]);

  for (const fa of allFAs) {
    combined[fa] = (TAG_body[fa] || 0) + (TAG_blood[fa] || 0);
  }

  const total = Object.values(combined).reduce((sum, val) => sum + val, 0);
  const profile: Record<FattyAcidId, number> = {};

  for (const fa of Object.keys(combined)) {
    profile[fa] = total > 0 ? (combined[fa] / total) * 100 : 0;
  }
  return profile;
}
