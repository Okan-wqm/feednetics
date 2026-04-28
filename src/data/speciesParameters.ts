/**
 * FEEDNETICS Model - Species-Specific Calibration Parameters
 *
 * Five fish species:
 *   - Gilthead seabream (Sparus aurata)
 *   - European seabass (Dicentrarchus labrax)
 *   - Atlantic salmon (Salmo salar)
 *   - Rainbow trout (Oncorhynchus mykiss)
 *   - Nile tilapia (Oreochromis niloticus)
 *
 * Confidence per species:
 *   HIGH    seabream  (full EP-model param table from Nobre et al. 2019)
 *   MEDIUM  seabass   (Lupatsch & Kissil 2001 FM coefficients)
 *   MEDIUM  tilapia   (Raposo et al. 2024 + Chowdhury et al. 2013 FM at 28 °C)
 *   LOW     salmon    (literature ranges only — TODO)
 *   LOW     trout     (Cho & Kaushik 1990 / Bureau ranges — TODO)
 *
 * Parameter groups still held in shared baselines (TODO Soares et al. 2023):
 *   proteinMetabolism, gluconeogenesis, glucoseOxidation, lipogenesis
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
// Feed Intake (Lupatsch family: FI = a · BW^b · exp(c·T), BW [g], T [°C])
// ============================================================================

const FEED_INTAKE: Record<FishSpecies, FeedIntakeParams> = {
  // Lupatsch et al. 2003a, Aquaculture
  gilthead_seabream: { a: 0.0586, b: 0.578, c: 0.062, T_low: 11, T_high: 28, beta: 1.0 },
  // Lupatsch & Kissil 2001, Aquaculture 202:289
  european_seabass:  { a: 0.0640, b: 0.587, c: 0.070, T_low: 12, T_high: 28, beta: 1.0 },
  // Bureau & Cho 1998 / Lupatsch 2010 (simplified linear T form)
  atlantic_salmon:   { a: 0.0060, b: 0.800, c: 0.050, T_low:  4, T_high: 20, beta: 1.0 },
  // Cho & Kaushik 1990 / Bureau 2003
  rainbow_trout:     { a: 0.0250, b: 0.700, c: 0.060, T_low:  4, T_high: 19, beta: 1.0 },
  // Lupatsch 2010 (Oreochromis); Raposo et al. 2024 validation envelope
  nile_tilapia:      { a: 0.0450, b: 0.700, c: 0.055, T_low: 21, T_high: 30, beta: 1.0 },
};

// ============================================================================
// Energy maintenance — basal ATP / FM_E
// Model formula: ATP_cost_basal = basalATP_a · BW^basalATP_b · exp(basalATP_c·T)
//                BW in g, output in the model's energy units.
// Values below come from FM_E equations of the form a' · BW(kg)^b · exp(c·T)
// kJ/d, converted to BW(g) via a = a' / 1000^b.
// ============================================================================

const ENERGY_METABOLISM: Record<FishSpecies, EnergyMetabolismParams> = {
  // Nobre et al. 2019, Aquac. Eng. 84:12, Table 1: FM_E = 7.43·e^(0.068T)·BW(kg)^0.80
  // Conversion: 7.43 / 1000^0.80 = 0.02958
  gilthead_seabream: { feedCostScale: 1.0, basalATP_a: 0.02958, basalATP_b: 0.80, basalATP_c: 0.068 },

  // Lupatsch & Kissil 2001: DE_m = 43.6 kJ·BW(kg)^0.79/d at trial mean T (~25 °C)
  // Assuming c=0.07: a₀ = 43.6/exp(0.07·25) = 7.58 → /1000^0.79 = 0.03232
  european_seabass:  { feedCostScale: 1.0, basalATP_a: 0.03232, basalATP_b: 0.79, basalATP_c: 0.070 },

  // TODO: Atlantic salmon FM_E equation pending. Salmonid review reports
  // 75-100 kJ/kg·d maintenance, fasting energy loss ≈ 0.518·BW(kg)^0.80 kJ/d.
  // Approximated with seabream-like temperature coefficient.
  atlantic_salmon:   { feedCostScale: 1.0, basalATP_a: 0.00206, basalATP_b: 0.80, basalATP_c: 0.050 },

  // TODO: Rainbow trout. Cho & Kaushik 1990 / Bureau: DE_m ≈ 67 kJ/kg^0.8/d
  // at T~15 °C; basal/fasting ~30-40 kJ/kg^0.8/d. Approximated.
  rainbow_trout:     { feedCostScale: 1.0, basalATP_a: 0.06700, basalATP_b: 0.80, basalATP_c: 0.050 },

  // Chowdhury et al. 2013: DE_m = 25.9 kJ/(kg^0.80·d) at 28 °C
  // a₀ = 25.9/exp(0.068·28) = 3.84 → /1000^0.80 = 0.01530
  nile_tilapia:      { feedCostScale: 1.0, basalATP_a: 0.01530, basalATP_b: 0.80, basalATP_c: 0.068 },
};

// ============================================================================
// Amino-acid / protein maintenance — FM_P
// Model formula: min_AA_loss = req_prot_a · exp(req_prot_b·T) · (BW/1000)^req_prot_c
//                BW in g (model divides by 1000 internally to get kg).
// Values below come from FM_P equations of the form a · exp(b·T) · BW(kg)^c, g/d.
// ============================================================================

const AA_MAINTENANCE: Record<FishSpecies, AAMaintenanceParams> = {
  // Nobre et al. 2019, Table 1: FM_P = 0.061·e^(0.068T)·BW(kg)^0.70
  gilthead_seabream: { req_prot_a: 0.061, req_prot_b: 0.068, req_prot_c: 0.70 },

  // Lupatsch & Kissil 2001: DP_m = 0.66·BW(kg)^0.69 (T-independent in published form)
  european_seabass:  { req_prot_a: 0.660, req_prot_b: 0.000, req_prot_c: 0.69 },

  // TODO: Atlantic salmon FM_P equation pending. Approximated with seabream form.
  atlantic_salmon:   { req_prot_a: 0.061, req_prot_b: 0.068, req_prot_c: 0.70 },

  // TODO: Rainbow trout FM_P. Approximated with seabream form.
  rainbow_trout:     { req_prot_a: 0.061, req_prot_b: 0.068, req_prot_c: 0.70 },

  // Chowdhury et al. 2013: DP_m = 0.45 g/(kg^0.80·d) at 28 °C; T-independent form.
  nile_tilapia:      { req_prot_a: 0.450, req_prot_b: 0.000, req_prot_c: 0.80 },
};

// ============================================================================
// Optimal-temperature anchor used by the protein-degradation submodel
// (V_db / V_dm response in proteinMetabolism)
// ============================================================================

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
// These groups concern the protein-flux submodel (k_RNA, ribosome dynamics,
// V_db/V_dm, AA flux betas) and the carbon-metabolism submodel
// (gluconeogenesis, glucose oxidation, lipogenesis), whose species-specific
// calibrated values appear only in the FEEDNETICS paper / its supplement.
// ============================================================================

const BASELINE_PROTEIN_METABOLISM: ProteinMetabolismParams = {
  k_RNA_min:        0.10,
  k_RNA_max:        1.50,
  C_s:              0.05,
  temperatureEffect: 0.07,
  k_ribo:           0.20,
  k_deg:            0.05,
  V_db:             0.04,
  V_dm:             0.02,
  T_optimal:        22, // overridden per species via T_OPTIMAL
  protDegMinFactor: 0.30,
  AA_synt_beta:     0.50,
  AA_deg_beta_1:    0.10,
  AA_deg_beta_2:    0.20,
};

const BASELINE_GLUCONEOGENESIS:    GluconeogenesisParams   = { a_gluconeo: 0.10, b: 0.80 };
const BASELINE_GLUCOSE_OXIDATION:  GlucoseOxidationParams  = { a_glucox:   0.05, b: 0.80 };
const BASELINE_LIPOGENESIS:        LipogenesisParams       = { a_lipogen:  0.02, b: 0.80 };

// ============================================================================
// Assembled per-species parameter objects
// ============================================================================

function build(species: FishSpecies): SpeciesParams {
  return {
    feedIntake:        FEED_INTAKE[species],
    proteinMetabolism: { ...BASELINE_PROTEIN_METABOLISM, T_optimal: T_OPTIMAL[species] },
    energyMetabolism:  ENERGY_METABOLISM[species],
    aaMaintenance:     AA_MAINTENANCE[species],
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
