/**
 * FEEDNETICS Model - Formula Modules Index
 *
 * Re-exports all formula modules for convenient importing
 *
 * Module Structure:
 * - calibration: Equations 1-4 (MAPE, CAE, WE_CL)
 * - feedIntake: Equations A.1-A.3 (Feed intake control)
 * - gutCompartment: Equations A.4-A.8 (Digestion & Absorption)
 * - bodyComposition: Equations A.9-A.11 (Body weight & Composition)
 * - energyModel: Equations A.12-A.18 (ATP balance & Oxidation)
 * - nitrogenMetabolism: Equations A.19-A.42 (Protein & AA metabolism)
 * - carbonMetabolism: Equations A.43-A.46 (Glucose & Lipid metabolism)
 * - performance: Performance indicators (RGR, SGR, FCR, etc.)
 */

// Re-export all types from types.ts
export {
  AminoAcidId,
  FattyAcidId,
  FishSpecies,
  TemperatureInput,
  FeedProperties,
  ModelInputs,
  FeedIntakeParams,
  ProteinMetabolismParams,
  EnergyMetabolismParams,
  AAMaintenanceParams,
  GluconeogenesisParams,
  GlucoseOxidationParams,
  LipogenesisParams,
  SpeciesParams,
  GutState,
  BodyComposition,
  RibosomeState,
  FishState,
  ValidationMetrics,
  PerformanceIndicators,
  MetabolicFluxes,
  ATPBalance,
  SimulationOutput,
  AA_MOLECULAR_WEIGHTS,
  MODEL_TIMESTEP
} from '../types';

// Calibration metrics (Equations 1-4)
export {
  calculateMAPE,
  calculateCAE,
  calculateWE_CL,
  calibrationObjective,
  type ObservedPredicted
} from './calibration';

// Feed intake control (Equations A.1-A.3)
export {
  calculateFI_max_original,
  calculateFI_max_smooth,
  calculateActualFeedIntake,
  calculateFeedIntake,
  feedFromTable
} from './feedIntake';

// Gut compartment (Equations A.4-A.8)
export {
  calculateDigestibleIntake,
  calculateDigestionRate,
  calculateAbsorptionRate,
  calculateEnzymeDynamics,
  calculateReceptorDynamics,
  updateGutState,
  getAbsorbedNutrients,
  type GutKinetics
} from './gutCompartment';

// Body composition (Equations A.9-A.11)
export {
  calculateTotalProtein,
  calculateTotalLipid,
  calculateCL_q,
  calculateLipidRef,
  calculateBodyWeight,
  calculateCrudeProteinPercent,
  calculateCrudeLipidPercent,
  calculateTotalFreeAA,
  getAAProfile,
  getFAProfile,
  FA_MOLECULAR_WEIGHTS
} from './bodyComposition';

// Energy model (Equations A.12-A.18)
export {
  calculateATPExpenditure,
  calculateATPRequired,
  calculateAAtoFAOxidationRatio,
  calculateATPStoichAA,
  calculateATPStoichFA,
  calculateMassAAOxidized,
  adjustAAOxidation,
  calculateMassFAOxidized,
  calculateEnergyBalance,
  constrainATPExpenditure,
  ATP_STOICH_AA,
  ATP_STOICH_FA,
  MAX_ATP_EXPENDITURE_PER_G_PER_HOUR
} from './energyModel';

// Nitrogen metabolism (Equations A.19-A.42)
export {
  // Protein synthesis (A.19-A.29)
  calculateMaxProteinSynthesis,
  calculateTemperatureEffectSynthesis,
  calculateRibosomeActivation,
  calculateRibosomeDeactivation,
  updateRibosomeState,
  calculateRibosomeActivity,
  calculateTranslationRate,
  calculateProteinSynthesisRegulator,
  calculateAASynthesisValve,
  calculateActualProteinSynthesis,
  // Protein degradation (A.30-A.34)
  calculateMaxProteinDegradation,
  calculateDegradationTempFactor,
  calculateMinProteinDegradation,
  calculateAADegradationValve,
  calculateActualProteinDegradation,
  // AA oxidation (A.35-A.40)
  calculateMinAALoss,
  normalizeAAFreeMax,
  normalizeAAFreeMin,
  calculateAAOxidationValve,
  calculateAAOxidationWeights,
  calculateAAOxidationRate,
  // Gluconeogenesis (A.41-A.42)
  calculateMaxGluconeogenesis,
  calculateActualGluconeogenesis,
  calculateGluconeogenesisWeights,
  // NEAA synthesis
  calculateNEAASynthesis,
  methionineToCysteine,
  phenylalanineToTyrosine,
  // Constants
  GLUCONEOGENESIS_STOICH,
  NEAA_SYNTHESIS_STOICH
} from './nitrogenMetabolism';

// Carbon metabolism (Equations A.43-A.46)
export {
  calculateMaxGlucoseOxidation,
  calculateActualGlucoseOxidation,
  calculateMaxGlycogenTurnover,
  calculateGlycogenesis,
  calculateGlycogenolysis,
  calculateNetGlycogenFlux,
  calculateMaxLipogenesis,
  calculateActualLipogenesis,
  calculateFAFromLipogenesis,
  calculateFABetaOxidation,
  calculateFAOxidationWeights,
  calculateCarbonMetabolism,
  calculateATPFromGlucose,
  GLUCOSE_PER_PALMITATE,
  ATP_PER_GLUCOSE,
  type GlycogenParams
} from './carbonMetabolism';

// Performance indicators
export {
  calculateRGR,
  calculateSGR,
  calculateFCR,
  calculateFeedEfficiency,
  calculatePER,
  calculateNRE,
  calculateLRE,
  calculateERE,
  calculateTGC,
  calculateConditionFactor,
  calculateHSI,
  calculateVSI,
  calculateSurvivalRate,
  calculateDFI,
  calculatePerformanceMetrics,
  type PerformanceData,
  type PerformanceMetrics
} from './performance';
