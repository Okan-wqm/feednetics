/**
 * FEEDNETICS Model - Type Definitions
 * Based on: Soares et al. (2023). J. Mar. Sci. Eng., 11, 472.
 */

// ============================================================================
// Basic Types
// ============================================================================

/** Amino acid identifier (20 proteinogenic amino acids) */
export type AminoAcidId =
  | 'Ala' | 'Arg' | 'Asn' | 'Asp' | 'Cys'
  | 'Gln' | 'Glu' | 'Gly' | 'His' | 'Ile'
  | 'Leu' | 'Lys' | 'Met' | 'Phe' | 'Pro'
  | 'Ser' | 'Thr' | 'Trp' | 'Tyr' | 'Val';

/** Fatty acid identifier (20 different fatty acids) */
export type FattyAcidId = string;

/** Fish species supported by the model */
export type FishSpecies =
  | 'gilthead_seabream'    // Sparus aurata
  | 'european_seabass'     // Dicentrarchus labrax
  | 'atlantic_salmon'      // Salmo salar
  | 'rainbow_trout'        // Oncorhynchus mykiss
  | 'nile_tilapia';        // Oreochromis niloticus

// ============================================================================
// Model Input Types
// ============================================================================

/** Temperature input for the model */
export interface TemperatureInput {
  /** Daily average temperature (°C) */
  dailyAverage: number;
  /** Daily temperature amplitude (°C) */
  dailyAmplitude: number;
}

/** Feed properties */
export interface FeedProperties {
  /** Crude protein content (% as fed) */
  crudeProtein: number;
  /** Crude lipids content (% as fed) */
  crudeLipids: number;
  /** Ash content (% as fed) */
  ash: number;
  /** Fiber content (% as fed) */
  fiber: number;
  /** Gross energy (MJ/kg) */
  grossEnergy: number;
  /** Phosphorus content (%) */
  phosphorus: number;
  /** Apparent digestibility coefficients */
  adc: {
    crudeProtein: number;
    crudeLipids: number;
    grossEnergy: number;
    phosphorus: number;
  };
  /** Amino acid profile (g/100g protein) */
  aminoAcidProfile: Record<AminoAcidId, number>;
  /** Fatty acid profile (g/100g lipid) */
  fattyAcidProfile: Record<FattyAcidId, number>;
}

/** Model inputs at a given time step */
export interface ModelInputs {
  /** Current temperature (°C) */
  temperature: number;
  /** Feed given (g/day) */
  feedGiven: number;
  /** Feed properties */
  feedProperties: FeedProperties;
  /** Current time (days) */
  time: number;
}

// ============================================================================
// Species-Specific Parameters
// ============================================================================

/** Feed intake parameters (Lupatsch model) */
export interface FeedIntakeParams {
  a: number;
  b: number;
  c: number;
  T_low: number;
  T_high: number;
  beta: number;
}

/** Protein metabolism parameters */
export interface ProteinMetabolismParams {
  /** Translation rate constants */
  k_RNA_min: number;
  k_RNA_max: number;
  /** Transcription rate */
  C_s: number;
  /** Temperature effect coefficient */
  temperatureEffect: number;
  /** Ribosome rate constant */
  k_ribo: number;
  /** Degradation rate constant */
  k_deg: number;
  /** Degradation temperature parameters */
  V_db: number;
  V_dm: number;
  T_optimal: number;
  /** Protein degradation minimum factor */
  protDegMinFactor: number;
  /** AA synthesis beta */
  AA_synt_beta: number;
  /** AA degradation betas */
  AA_deg_beta_1: number;
  AA_deg_beta_2: number;
}

/** Energy metabolism parameters */
export interface EnergyMetabolismParams {
  /** Feed cost scale */
  feedCostScale: number;
  /** Basal ATP cost parameters */
  basalATP_a: number;
  basalATP_b: number;
  basalATP_c: number;
}

/** Amino acid maintenance parameters */
export interface AAMaintenanceParams {
  req_prot_a: number;
  req_prot_b: number;
  req_prot_c: number;
}

/** Gluconeogenesis parameters */
export interface GluconeogenesisParams {
  a_gluconeo: number;
  b: number;
}

/** Glucose oxidation parameters */
export interface GlucoseOxidationParams {
  a_glucox: number;
  b: number;
}

/** Lipogenesis parameters */
export interface LipogenesisParams {
  a_lipogen: number;
  b: number;
}

/** Complete species parameters */
export interface SpeciesParams {
  feedIntake: FeedIntakeParams;
  proteinMetabolism: ProteinMetabolismParams;
  energyMetabolism: EnergyMetabolismParams;
  aaMaintenance: AAMaintenanceParams;
  gluconeogenesis: GluconeogenesisParams;
  glucoseOxidation: GlucoseOxidationParams;
  lipogenesis: LipogenesisParams;
}

// ============================================================================
// State Variables
// ============================================================================

/** Gut compartment state */
export interface GutState {
  /** Digestible nutrients (mol) */
  digestible: Record<string, number>;
  /** Digested nutrients (mol) */
  digested: Record<string, number>;
  /** Enzyme level */
  enzyme: number;
  /** Receptor level */
  receptor: number;
}

/** Body composition state */
export interface BodyComposition {
  /** Protein pool by amino acid (mol) */
  proteinAA: Record<AminoAcidId, number>;
  /** Body TAG by fatty acid (mol) */
  TAG_body: Record<FattyAcidId, number>;
  /** Blood TAG by fatty acid (mol) */
  TAG_blood: Record<FattyAcidId, number>;
  /** Glycogen (mol) */
  glycogen: number;
  /** Free amino acids (mol) */
  freeAA: Record<AminoAcidId, number>;
  /** Glucose (mol) */
  glucose: number;
}

/** Ribosome state */
export interface RibosomeState {
  occupied: number;
  unoccupied: number;
}

/** Complete fish state */
export interface FishState {
  /** Body weight (g) */
  bodyWeight: number;
  /** Gut compartment */
  gut: GutState;
  /** Body composition */
  composition: BodyComposition;
  /** Ribosome state */
  ribosome: RibosomeState;
  /** Fed state [0,1] */
  fedScaling: number;
  /** Fasting state */
  starving: number;
}

// ============================================================================
// Molecular Weights
// ============================================================================

/** Amino acid molecular weights (g/mol) */
export const AA_MOLECULAR_WEIGHTS: Record<AminoAcidId, number> = {
  Ala: 89.09,
  Arg: 174.20,
  Asn: 132.12,
  Asp: 133.10,
  Cys: 121.16,
  Gln: 146.15,
  Glu: 147.13,
  Gly: 75.07,
  His: 155.16,
  Ile: 131.18,
  Leu: 131.18,
  Lys: 146.19,
  Met: 149.21,
  Phe: 165.19,
  Pro: 115.13,
  Ser: 105.09,
  Thr: 119.12,
  Trp: 204.23,
  Tyr: 181.19,
  Val: 117.15
};

// ============================================================================
// Output Types
// ============================================================================

/** Calibration/Validation metrics */
export interface ValidationMetrics {
  /** Mean Absolute Percentage Error (%) */
  MAPE: number;
  /** Cumulative Absolute Error (g) */
  CAE: number;
  /** Crude Lipids Weighted Error */
  WE_CL: number;
}

/** Growth performance indicators */
export interface PerformanceIndicators {
  /** Relative Growth Rate (%/day) */
  RGR: number;
  /** Specific Growth Rate (%/day) */
  SGR: number;
  /** Feed Conversion Ratio */
  FCR: number;
  /** Protein Efficiency Ratio */
  PER: number;
}

/** Metabolic fluxes output */
export interface MetabolicFluxes {
  /** Protein synthesis rate (g/day) */
  proteinSynthesis: number;
  /** Protein degradation rate (g/day) */
  proteinDegradation: number;
  /** AA oxidation rate (g/day) */
  aaOxidation: number;
  /** FA beta-oxidation rate (g/day) */
  faBetaOxidation: number;
  /** Gluconeogenesis rate (mol/day) */
  gluconeogenesis: number;
  /** Glucose oxidation rate (mol/day) */
  glucoseOxidation: number;
  /** Lipogenesis rate (mol/day) */
  lipogenesis: number;
  /** Glycogenesis rate (mol/day) */
  glycogenesis: number;
  /** Glycogenolysis rate (mol/day) */
  glycogenolysis: number;
}

/** ATP balance */
export interface ATPBalance {
  /** ATP expenditure (mol/day) */
  expenditure: number;
  /** ATP from anabolic reactions (mol/day) */
  fromAnabolic: number;
  /** ATP from catabolic reactions (mol/day) */
  fromCatabolic: number;
  /** ATP from glucose oxidation (mol/day) */
  fromGlucoseOx: number;
  /** ATP from AA oxidation (mol/day) */
  fromAAOx: number;
  /** ATP from FA oxidation (mol/day) */
  fromFAOx: number;
  /** ATP required from oxidation (mol/day) */
  required: number;
}

/** Simulation output at a time step */
export interface SimulationOutput {
  time: number;
  fishState: FishState;
  fluxes: MetabolicFluxes;
  atpBalance: ATPBalance;
  feedIntake: number;
  performance: PerformanceIndicators;
}

/** Model time step (days) - approximately 14.4 minutes */
export const MODEL_TIMESTEP = 0.01;
