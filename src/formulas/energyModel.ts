/**
 * FEEDNETICS Model - Energetic Model
 * Equations (A.12) - (A.18)
 *
 * This module handles ATP balance and substrate oxidation
 */

import { EnergyMetabolismParams, BodyComposition, AminoAcidId, FattyAcidId, AA_MOLECULAR_WEIGHTS } from '../types';
import { calculateCL_q, calculateTotalProtein, calculateTotalLipid } from './bodyComposition';

/** ATP stoichiometry for amino acid oxidation (mol ATP / mol AA) */
export const ATP_STOICH_AA: Record<AminoAcidId, number> = {
  Ala: 13, Arg: 25, Asn: 16, Asp: 15, Cys: 12,
  Gln: 18, Glu: 18, Gly: 6,  His: 17, Ile: 30,
  Leu: 32, Lys: 28, Met: 20, Phe: 34, Pro: 22,
  Ser: 12, Thr: 16, Trp: 36, Tyr: 34, Val: 26
};

/** ATP stoichiometry for fatty acid beta-oxidation (mol ATP / mol FA) */
export const ATP_STOICH_FA: Record<string, number> = {
  'C14:0': 92,    // Myristic acid
  'C16:0': 106,   // Palmitic acid
  'C16:1': 104,   // Palmitoleic acid
  'C18:0': 120,   // Stearic acid
  'C18:1': 118,   // Oleic acid
  'C18:2': 116,   // Linoleic acid
  'C18:3': 114,   // Linolenic acid
  'C20:4': 126,   // Arachidonic acid
  'C20:5': 124,   // EPA
  'C22:6': 134,   // DHA
};

/**
 * Equation (A.12): ATP Expenditure
 *
 * ATP_exp = ATP_cost_anab + (1 + fed_scaling × feed_cost_scale) × ATP_cost_basal(BW, T)
 *
 * @param ATP_cost_anab ATP costs from anabolic reactions (mol/day)
 * @param fedScaling Fed state [0,1]
 * @param feedCostScale Parameter controlling feeding costs
 * @param bodyWeight Body weight (g)
 * @param temperature Temperature (°C)
 * @param params Energy metabolism parameters
 * @returns Total ATP expenditure (mol/day)
 */
export function calculateATPExpenditure(
  ATP_cost_anab: number,
  fedScaling: number,
  feedCostScale: number,
  bodyWeight: number,
  temperature: number,
  params: EnergyMetabolismParams
): number {
  // Basal ATP cost: ATP_basal = a × BW^b × e^(c×T)
  const ATP_cost_basal = params.basalATP_a *
    Math.pow(bodyWeight, params.basalATP_b) *
    Math.exp(params.basalATP_c * temperature);

  // Total expenditure with feeding cost
  return ATP_cost_anab + (1 + fedScaling * feedCostScale) * ATP_cost_basal;
}

/**
 * Equation (A.13): Required ATP from Oxidation
 *
 * ATP_req = ATP_exp - ATP_prod_catab - ATP_prod_glucox
 *
 * @param ATP_exp Total ATP expenditure (mol/day)
 * @param ATP_prod_catab ATP from catabolic reactions (mol/day)
 * @param ATP_prod_glucox ATP from glucose oxidation (mol/day)
 * @returns Required ATP from substrate oxidation (mol/day)
 */
export function calculateATPRequired(
  ATP_exp: number,
  ATP_prod_catab: number,
  ATP_prod_glucox: number
): number {
  return Math.max(0, ATP_exp - ATP_prod_catab - ATP_prod_glucox);
}

/**
 * Equation (A.14): Amino Acid vs Fatty Acid Oxidation Balance
 *
 * m_ox_AA = [(1 - CL_q) / CL_q] × m_ox_FA
 *
 * CL_q determines the balance: higher CL_q = more FA oxidation
 *
 * @param CL_q Crude lipids control variable [0,1]
 * @param m_ox_FA Mass of fatty acids oxidized (g)
 * @returns Mass of amino acids to oxidize (g)
 */
export function calculateAAtoFAOxidationRatio(
  CL_q: number,
  m_ox_FA: number
): number {
  if (CL_q <= 0) return Infinity;
  if (CL_q >= 1) return 0;

  return ((1 - CL_q) / CL_q) * m_ox_FA;
}

/**
 * Calculate profile-dependent ATP yield from AA oxidation
 *
 * @param aaProfile AA profile (fraction of each AA)
 * @returns ATP yield (mol ATP / g AA)
 */
export function calculateATPStoichAA(
  aaProfile: Record<AminoAcidId, number>
): number {
  let totalATP = 0;
  let totalMass = 0;

  for (const aa of Object.keys(aaProfile) as AminoAcidId[]) {
    const fraction = aaProfile[aa] || 0;
    const atpPerMol = ATP_STOICH_AA[aa] || 15;
    const mw = AA_MOLECULAR_WEIGHTS[aa] || 110;

    // Contribution weighted by fraction
    totalATP += fraction * atpPerMol;
    totalMass += fraction * mw;
  }

  // mol ATP per gram
  return totalMass > 0 ? totalATP / totalMass : 0.15;
}

/**
 * Calculate profile-dependent ATP yield from FA beta-oxidation
 *
 * @param faProfile FA profile (fraction of each FA)
 * @returns ATP yield (mol ATP / g FA)
 */
export function calculateATPStoichFA(
  faProfile: Record<FattyAcidId, number>
): number {
  let totalATP = 0;
  let totalMass = 0;

  for (const fa of Object.keys(faProfile)) {
    const fraction = faProfile[fa] || 0;
    const atpPerMol = ATP_STOICH_FA[fa] || 106; // Default: palmitate
    const mw = 280; // Average FA MW

    totalATP += fraction * atpPerMol;
    totalMass += fraction * mw;
  }

  return totalMass > 0 ? totalATP / totalMass : 0.38;
}

/**
 * Equation (A.15) & (A.16): Mass of Amino Acids Oxidized
 *
 * From: ATP_req = m_ox_AA × ATP_stoich_AA + m_ox_FA × ATP_stoich_FA
 * And:  m_ox_AA = [(1-CL_q)/CL_q] × m_ox_FA
 *
 * Solving: m_ox_AA = ATP_req / [(CL_q/(1-CL_q)) × ATP_stoich_FA + ATP_stoich_AA]
 *
 * @param ATP_req Required ATP from oxidation (mol/day)
 * @param CL_q Crude lipids control variable
 * @param ATP_stoich_AA ATP yield from AA (mol ATP/g)
 * @param ATP_stoich_FA ATP yield from FA (mol ATP/g)
 * @returns Mass of amino acids to oxidize (g/day)
 */
export function calculateMassAAOxidized(
  ATP_req: number,
  CL_q: number,
  ATP_stoich_AA: number,
  ATP_stoich_FA: number
): number {
  if (CL_q >= 1) {
    // Only FA oxidation
    return 0;
  }
  if (CL_q <= 0) {
    // Only AA oxidation
    return ATP_stoich_AA > 0 ? ATP_req / ATP_stoich_AA : 0;
  }

  const denominator = (CL_q / (1 - CL_q)) * ATP_stoich_FA + ATP_stoich_AA;
  return denominator > 0 ? ATP_req / denominator : 0;
}

/**
 * Equation (A.17): Adjusted Amino Acid Oxidation
 *
 * m_ox_AA = max(calculated_m_ox_AA, min_AA_loss)
 *
 * Ensures minimum AA loss for maintenance even when lipid-replete
 *
 * @param calculated_m_ox_AA Calculated AA oxidation (g/day)
 * @param min_AA_loss Minimum AA loss for maintenance (g/day)
 * @returns Adjusted AA oxidation (g/day)
 */
export function adjustAAOxidation(
  calculated_m_ox_AA: number,
  min_AA_loss: number
): number {
  return Math.max(calculated_m_ox_AA, min_AA_loss);
}

/**
 * Equation (A.18): Fatty Acid Beta-Oxidation Rate
 *
 * m_ox_FA = (ATP_req - ATP_AA_ox) / ATP_stoich_FA
 *
 * @param ATP_req Required ATP from oxidation (mol/day)
 * @param ATP_AA_ox ATP generated from AA oxidation (mol/day)
 * @param ATP_stoich_FA ATP yield from FA (mol ATP/g)
 * @returns Mass of fatty acids to oxidize (g/day)
 */
export function calculateMassFAOxidized(
  ATP_req: number,
  ATP_AA_ox: number,
  ATP_stoich_FA: number
): number {
  const remaining = ATP_req - ATP_AA_ox;
  if (remaining <= 0 || ATP_stoich_FA <= 0) return 0;
  return remaining / ATP_stoich_FA;
}

/**
 * Complete energy balance calculation
 *
 * Integrates all energy equations to determine substrate oxidation
 */
export function calculateEnergyBalance(
  bodyWeight: number,
  temperature: number,
  composition: BodyComposition,
  fedScaling: number,
  ATP_cost_anab: number,
  ATP_prod_catab: number,
  glucoseOxidationRate: number,
  min_AA_loss: number,
  lipidRef: number,
  beta: number,
  params: EnergyMetabolismParams,
  aaProfile: Record<AminoAcidId, number>,
  faProfile: Record<FattyAcidId, number>
): {
  ATP_exp: number;
  ATP_req: number;
  m_ox_AA: number;
  m_ox_FA: number;
  CL_q: number;
} {
  // Calculate CL_q from body composition
  const lipidTotal = calculateTotalLipid(composition.TAG_body, composition.TAG_blood);
  const CL_q = calculateCL_q(lipidTotal, lipidRef, beta);

  // ATP from glucose oxidation (32 mol ATP / mol glucose)
  const ATP_prod_glucox = glucoseOxidationRate * 32;

  // Total ATP expenditure (A.12)
  const ATP_exp = calculateATPExpenditure(
    ATP_cost_anab,
    fedScaling,
    params.feedCostScale,
    bodyWeight,
    temperature,
    params
  );

  // Required ATP from oxidation (A.13)
  const ATP_req = calculateATPRequired(ATP_exp, ATP_prod_catab, ATP_prod_glucox);

  // ATP stoichiometries
  const ATP_stoich_AA = calculateATPStoichAA(aaProfile);
  const ATP_stoich_FA = calculateATPStoichFA(faProfile);

  // Mass of AA oxidized (A.16, A.17)
  let m_ox_AA = calculateMassAAOxidized(ATP_req, CL_q, ATP_stoich_AA, ATP_stoich_FA);
  m_ox_AA = adjustAAOxidation(m_ox_AA, min_AA_loss);

  // ATP from AA oxidation
  const ATP_AA_ox = m_ox_AA * ATP_stoich_AA;

  // Mass of FA oxidized (A.18)
  const m_ox_FA = calculateMassFAOxidized(ATP_req, ATP_AA_ox, ATP_stoich_FA);

  return {
    ATP_exp,
    ATP_req,
    m_ox_AA,
    m_ox_FA,
    CL_q
  };
}

/**
 * Maximum ATP expenditure constraint
 * Upper physiological limit: 600 µmol·g⁻¹·h⁻¹
 */
export const MAX_ATP_EXPENDITURE_PER_G_PER_HOUR = 600e-6; // mol/g/h

export function constrainATPExpenditure(
  ATP_exp: number,
  bodyWeight: number
): number {
  const maxATP = MAX_ATP_EXPENDITURE_PER_G_PER_HOUR * bodyWeight * 24; // mol/day
  return Math.min(ATP_exp, maxATP);
}
