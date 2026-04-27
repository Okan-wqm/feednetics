/**
 * FEEDNETICS Model - Species-Specific Calibration Parameters
 *
 * Calibrated for the five fish species supported by the model:
 *   - Gilthead seabream (Sparus aurata)
 *   - European seabass (Dicentrarchus labrax)
 *   - Atlantic salmon (Salmo salar)
 *   - Rainbow trout (Oncorhynchus mykiss)
 *   - Nile tilapia (Oreochromis niloticus)
 *
 * Status:
 *   - feedIntake (a, b, c, T_low, T_high, beta) and temperature ranges are
 *     species-specific, derived from the published Lupatsch-family models
 *     that FEEDNETICS builds on.
 *   - The remaining parameter groups (proteinMetabolism, energyMetabolism,
 *     aaMaintenance, gluconeogenesis, glucoseOxidation, lipogenesis) are
 *     held in shared baseline constants until the species-specific values
 *     from Soares et al. (2023, J. Mar. Sci. Eng., 11, 472) are wired in.
 *     Each baseline carries a TODO marker.
 */

import type {
  FishSpecies,
  SpeciesParams,
  FeedIntakeParams,
  ProteinMetabolismParams,
  EnergyMetabolismParams,
  AAMaintenanceParams,
  GluconeogenesisParams,
  GlucoseOxidationParams,
  LipogenesisParams,
} from '../types';

// ============================================================================
// Feed Intake (Lupatsch-family model: FI = a · BW^b · exp(c·T))
// ============================================================================
// BW in grams, T in °C. T_low / T_high bound the model's operating range and
// follow the validation envelopes reported in FEEDNETICS_FORMULAS.md (Table,
// "Body weight range" / "Temperature range" columns). beta is the sigmoid
// shape parameter; held at 1.0 across species pending calibration data.

const FEED_INTAKE: Record<FishSpecies, FeedIntakeParams> = {
  // Lupatsch et al. (2003), Aquaculture
  gilthead_seabream: { a: 0.0586, b: 0.578, c: 0.062, T_low: 11, T_high: 28, beta: 1.0 },
  // Lupatsch & Kissil (2001), Aquaculture
  european_seabass:  { a: 0.0640, b: 0.587, c: 0.070, T_low: 12, T_high: 28, beta: 1.0 },
  // Lupatsch (2010) / Bureau & Cho (1998) bioenergetic
  atlantic_salmon:   { a: 0.0060, b: 0.800, c: 0.050, T_low:  4, T_high: 20, beta: 1.0 },
  // Bureau & Cho (1998) / Lupatsch (2010)
  rainbow_trout:     { a: 0.0250, b: 0.700, c: 0.060, T_low:  4, T_high: 19, beta: 1.0 },
  // Lupatsch (2013), Trino & Bolivar (2008)
  nile_tilapia:      { a: 0.0450, b: 0.700, c: 0.055, T_low: 18, T_high: 30, beta: 1.0 },
};

// Optimal-temperature anchor used by the protein-degradation submodel
// (V_db / V_dm response). Sourced from each species' published thermal
// preference range; refined per species, but the protein-flux baseline
// below is shared.
const T_OPTIMAL: Record<FishSpecies, number> = {
  gilthead_seabream: 22,
  european_seabass:  22,
  atlantic_salmon:   13,
  rainbow_trout:     15,
  nile_tilapia:      28,
};

// ============================================================================
// Shared baselines — TODO: replace with species-calibrated values from
// Soares et al. (2023), J. Mar. Sci. Eng., 11, 472.
// ============================================================================
// Numerical anchors below come from the Pereira/Nobre EP-model lineage
// (gilthead seabream parameterisation) and are applied uniformly as a
// reasonable starting point. They do NOT yet reflect the per-species
// calibration reported in the FEEDNETICS paper.

const BASELINE_PROTEIN_METABOLISM: ProteinMetabolismParams = {
  k_RNA_min:        0.10,
  k_RNA_max:        1.50,
  C_s:              0.05,
  temperatureEffect: 0.07,
  k_ribo:           0.20,
  k_deg:            0.05,
  V_db:             0.04,
  V_dm:             0.02,
  T_optimal:        22,
  protDegMinFactor: 0.30,
  AA_synt_beta:     0.50,
  AA_deg_beta_1:    0.10,
  AA_deg_beta_2:    0.20,
};

const BASELINE_ENERGY_METABOLISM: EnergyMetabolismParams = {
  feedCostScale: 1.0,
  basalATP_a:    0.0438,
  basalATP_b:    0.80,
  basalATP_c:    0.05,
};

const BASELINE_AA_MAINTENANCE: AAMaintenanceParams = {
  req_prot_a: 0.66,
  req_prot_b: 0.69,
  req_prot_c: 0.05,
};

const BASELINE_GLUCONEOGENESIS: GluconeogenesisParams = {
  a_gluconeo: 0.10,
  b:          0.80,
};

const BASELINE_GLUCOSE_OXIDATION: GlucoseOxidationParams = {
  a_glucox: 0.05,
  b:        0.80,
};

const BASELINE_LIPOGENESIS: LipogenesisParams = {
  a_lipogen: 0.02,
  b:         0.80,
};

// ============================================================================
// Assembled per-species parameter objects
// ============================================================================

function build(species: FishSpecies): SpeciesParams {
  return {
    feedIntake:        FEED_INTAKE[species],
    proteinMetabolism: { ...BASELINE_PROTEIN_METABOLISM, T_optimal: T_OPTIMAL[species] },
    energyMetabolism:  { ...BASELINE_ENERGY_METABOLISM },
    aaMaintenance:     { ...BASELINE_AA_MAINTENANCE },
    gluconeogenesis:   { ...BASELINE_GLUCONEOGENESIS },
    glucoseOxidation:  { ...BASELINE_GLUCOSE_OXIDATION },
    lipogenesis:       { ...BASELINE_LIPOGENESIS },
  };
}

export const SPECIES_PARAMETERS: Record<FishSpecies, SpeciesParams> = {
  gilthead_seabream: build('gilthead_seabream'),
  european_seabass:  build('european_seabass'),
  atlantic_salmon:   build('atlantic_salmon'),
  rainbow_trout:     build('rainbow_trout'),
  nile_tilapia:      build('nile_tilapia'),
};

/** Look up the calibrated parameter set for a species. */
export function getSpeciesParams(species: FishSpecies): SpeciesParams {
  return SPECIES_PARAMETERS[species];
}
