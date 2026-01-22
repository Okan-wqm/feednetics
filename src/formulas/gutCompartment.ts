/**
 * FEEDNETICS Model - Gut Compartment: Digestion and Absorption
 * Equations (A.4) - (A.8)
 */

import { FeedProperties, GutState } from '../types';

/** Digestion/Absorption rate constants */
export interface GutKinetics {
  k_digestion: number;
  k_absorption: number;
  k_enz_prod: number;
  k_enz_deg: number;
  k_rec_prod: number;
  k_rec_deg: number;
}

/**
 * Equation (A.4): Digestible Nutrient Intake
 *
 * DI_nutrient = (FI × ADC_nutrient × feed_nutrient) / Mw_nutrient
 *
 * @param feedIntake Actual feed intake (g/day)
 * @param adc Apparent digestibility coefficient
 * @param feedNutrient Percentage of nutrient in feed (0-100)
 * @param molecularWeight Molecular weight of nutrient (g/mol)
 * @returns Digestible intake (mol/day)
 */
export function calculateDigestibleIntake(
  feedIntake: number,
  adc: number,
  feedNutrient: number,
  molecularWeight: number
): number {
  return (feedIntake * adc * (feedNutrient / 100)) / molecularWeight;
}

/**
 * Equation (A.5): Digestion Rate (Second-order Kinetics)
 *
 * digestion_nutrient = k_digestion × enzyme × digestible_nutrient
 *
 * @param k_digestion Digestion rate constant
 * @param enzyme Current enzyme level
 * @param digestibleNutrient Digestible nutrient amount (mol)
 * @returns Digestion rate (mol/day)
 */
export function calculateDigestionRate(
  k_digestion: number,
  enzyme: number,
  digestibleNutrient: number
): number {
  return k_digestion * enzyme * digestibleNutrient;
}

/**
 * Equation (A.6): Absorption Rate (Second-order Kinetics)
 *
 * absorption_nutrient = k_absorption × receptor × digested_nutrient
 *
 * @param k_absorption Absorption rate constant
 * @param receptor Current receptor level
 * @param digestedNutrient Digested nutrient amount (mol)
 * @returns Absorption rate (mol/day)
 */
export function calculateAbsorptionRate(
  k_absorption: number,
  receptor: number,
  digestedNutrient: number
): number {
  return k_absorption * receptor * digestedNutrient;
}

/**
 * Equation (A.7): Enzyme Dynamics
 *
 * d(enzyme)/dt = (k_enz_prod × Σ digestible_nutrient) - k_enz_deg × enzyme
 *
 * @param k_enz_prod Enzyme production rate constant
 * @param k_enz_deg Enzyme degradation rate constant
 * @param totalDigestible Sum of all digestible nutrients (mol)
 * @param currentEnzyme Current enzyme level
 * @returns Rate of change of enzyme (1/day)
 */
export function calculateEnzymeDynamics(
  k_enz_prod: number,
  k_enz_deg: number,
  totalDigestible: number,
  currentEnzyme: number
): number {
  const production = k_enz_prod * totalDigestible;
  const degradation = k_enz_deg * currentEnzyme;
  return production - degradation;
}

/**
 * Equation (A.8): Receptor Dynamics
 *
 * d(receptor)/dt = (k_rec_prod × Σ digested_nutrient) - k_rec_deg × receptor
 *
 * @param k_rec_prod Receptor production rate constant
 * @param k_rec_deg Receptor degradation rate constant
 * @param totalDigested Sum of all digested nutrients (mol)
 * @param currentReceptor Current receptor level
 * @returns Rate of change of receptor (1/day)
 */
export function calculateReceptorDynamics(
  k_rec_prod: number,
  k_rec_deg: number,
  totalDigested: number,
  currentReceptor: number
): number {
  const production = k_rec_prod * totalDigested;
  const degradation = k_rec_deg * currentReceptor;
  return production - degradation;
}

/**
 * Update gut state for one time step (Forward Euler integration)
 *
 * @param currentState Current gut state
 * @param feedIntake Actual feed intake (g/day)
 * @param feedProps Feed properties
 * @param kinetics Kinetic parameters
 * @param dt Time step (days)
 * @returns Updated gut state
 */
export function updateGutState(
  currentState: GutState,
  feedIntake: number,
  feedProps: FeedProperties,
  kinetics: GutKinetics,
  dt: number
): GutState {
  // Calculate digestible intakes for major nutrients
  const proteinMw = 110; // Average amino acid MW
  const lipidMw = 280;   // Average fatty acid MW

  const digestibleProtein = calculateDigestibleIntake(
    feedIntake,
    feedProps.adc.crudeProtein,
    feedProps.crudeProtein,
    proteinMw
  );

  const digestibleLipid = calculateDigestibleIntake(
    feedIntake,
    feedProps.adc.crudeLipids,
    feedProps.crudeLipids,
    lipidMw
  );

  const totalDigestible = digestibleProtein + digestibleLipid;

  // Calculate digestion rates
  const proteinDigestionRate = calculateDigestionRate(
    kinetics.k_digestion,
    currentState.enzyme,
    currentState.digestible['protein'] || 0
  );

  const lipidDigestionRate = calculateDigestionRate(
    kinetics.k_digestion,
    currentState.enzyme,
    currentState.digestible['lipid'] || 0
  );

  // Calculate absorption rates
  const proteinAbsorptionRate = calculateAbsorptionRate(
    kinetics.k_absorption,
    currentState.receptor,
    currentState.digested['protein'] || 0
  );

  const lipidAbsorptionRate = calculateAbsorptionRate(
    kinetics.k_absorption,
    currentState.receptor,
    currentState.digested['lipid'] || 0
  );

  const totalDigested = (currentState.digested['protein'] || 0) + (currentState.digested['lipid'] || 0);

  // Calculate enzyme and receptor dynamics
  const dEnzyme = calculateEnzymeDynamics(
    kinetics.k_enz_prod,
    kinetics.k_enz_deg,
    totalDigestible,
    currentState.enzyme
  );

  const dReceptor = calculateReceptorDynamics(
    kinetics.k_rec_prod,
    kinetics.k_rec_deg,
    totalDigested,
    currentState.receptor
  );

  // Update state (Forward Euler)
  const newDigestible: Record<string, number> = {
    protein: (currentState.digestible['protein'] || 0) + (digestibleProtein - proteinDigestionRate) * dt,
    lipid: (currentState.digestible['lipid'] || 0) + (digestibleLipid - lipidDigestionRate) * dt
  };

  const newDigested: Record<string, number> = {
    protein: (currentState.digested['protein'] || 0) + (proteinDigestionRate - proteinAbsorptionRate) * dt,
    lipid: (currentState.digested['lipid'] || 0) + (lipidDigestionRate - lipidAbsorptionRate) * dt
  };

  return {
    digestible: newDigestible,
    digested: newDigested,
    enzyme: Math.max(0, currentState.enzyme + dEnzyme * dt),
    receptor: Math.max(0, currentState.receptor + dReceptor * dt)
  };
}

/**
 * Get absorbed nutrients for use by other compartments
 */
export function getAbsorbedNutrients(
  gutState: GutState,
  kinetics: GutKinetics
): { protein: number; lipid: number } {
  return {
    protein: calculateAbsorptionRate(
      kinetics.k_absorption,
      gutState.receptor,
      gutState.digested['protein'] || 0
    ),
    lipid: calculateAbsorptionRate(
      kinetics.k_absorption,
      gutState.receptor,
      gutState.digested['lipid'] || 0
    )
  };
}
