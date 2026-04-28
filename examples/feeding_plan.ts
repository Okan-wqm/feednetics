/**
 * Inverse simulation: target-driven feeding plan
 * (How FEEDNETICS web app actually works)
 *
 * User inputs:
 *   W0:      initial body weight (g)
 *   W_target: target body weight (g)
 *   months:  time to reach target (months)
 *   T_avg:   average operating temperature (°C)
 *   species: fish species
 *   waste:   feed waste fraction (0.10 = 10%)
 *
 * Outputs:
 *   - Required SGR
 *   - Daily feeding schedule (g/fish/day)
 *   - Predicted FCR (apparent and biological)
 *   - Total feed needed
 *   - Feasibility check (within max FI?)
 */

import { getSpeciesParams, FishSpecies } from '../src';

interface PlanInput {
  species: FishSpecies;
  W0: number;        // g
  W_target: number;  // g
  months: number;
  T_avg: number;     // °C
  waste: number;     // fraction (0.0 - 0.3)
  N?: number;        // fish count for batch totals
}

function planFeeding(input: PlanInput) {
  const { species, W0, W_target, months, T_avg, waste, N = 1 } = input;
  const days = Math.round(months * 30);
  const params = getSpeciesParams(species);
  const fi = params.feedIntake;

  // Target SGR
  const target_SGR = 100 * (Math.log(W_target) - Math.log(W0)) / days;
  const target_TGC = 1000 * (Math.pow(W_target, 1/3) - Math.pow(W0, 1/3)) / (T_avg * days);

  // Calculate growth trajectory using exponential model BW(t) = W0 × exp(SGR × t/100)
  const trajectory: { day: number, bw: number, fi_max: number, fi_required: number, give: number, ration_pct: number }[] = [];
  let total_consumed = 0;

  for (let d = 0; d <= days; d++) {
    const bw = W0 * Math.exp(target_SGR / 100 * d);

    // Maximum FI from Lupatsch
    const fi_max = fi.a * Math.pow(bw, fi.b) * Math.exp(fi.c * T_avg);

    // Required FI to support growth at target SGR
    // dBW/dt = bw × SGR/100, then FI = (dBW/dt) × FCR_target
    // We don't know FCR a priori, so derive from energy balance.
    // Simplified: required FI ≈ daily_growth × estimated_FCR
    // Use FCR ≈ 1.0 + 0.5 × (FM/(FI×0.6))  iteratively, or use literature FCR
    // For trout: typical FCR=1.1-1.5; for salmon=1.0-1.2; for tilapia=1.5-1.7

    const literatureFCR: Record<FishSpecies, number> = {
      gilthead_seabream: 1.7,
      european_seabass:  1.6,
      atlantic_salmon:   1.1,
      rainbow_trout:     1.3,  // mid-range commercial
      nile_tilapia:      1.5,
    };
    const FCR = literatureFCR[species];

    const daily_growth = bw * target_SGR / 100;
    const fi_required = daily_growth * FCR;
    const give = fi_required / (1 - waste);
    const ration_pct = (fi_required / bw) * 100;

    if (d % Math.max(1, Math.round(days/12)) === 0 || d === days) {
      trajectory.push({ day: d, bw, fi_max, fi_required, give, ration_pct });
    }
    if (d < days) total_consumed += fi_required;
  }

  const total_given = total_consumed / (1 - waste);
  const total_gain = W_target - W0;
  const FCR_apparent = total_given / total_gain;
  const FCR_biological = total_consumed / total_gain;

  // Feasibility check: does required FI exceed max FI at any point?
  const violations = trajectory.filter(p => p.fi_required > p.fi_max);
  const feasible = violations.length === 0;

  return {
    species, W0, W_target, days, months, T_avg, waste, N,
    target_SGR, target_TGC,
    trajectory, total_consumed, total_given,
    total_gain, FCR_apparent, FCR_biological,
    feasible, violations
  };
}

// =========================================
// User's example: 200g → 1800g in 6 months
// =========================================
const examples: PlanInput[] = [
  // User's actual scenario
  { species: 'rainbow_trout', W0: 200, W_target: 1800, months: 6, T_avg: 15, waste: 0.10, N: 1000 },
  // Variations
  { species: 'rainbow_trout', W0: 100, W_target: 1500, months: 7, T_avg: 13, waste: 0.10, N: 1000 },
  { species: 'gilthead_seabream', W0: 50, W_target: 400, months: 9, T_avg: 22, waste: 0.10, N: 5000 },
  { species: 'atlantic_salmon', W0: 100, W_target: 4000, months: 18, T_avg: 10, waste: 0.10, N: 10000 },
  { species: 'nile_tilapia', W0: 30, W_target: 600, months: 6, T_avg: 28, waste: 0.10, N: 5000 },
];

const labels: Record<FishSpecies, string> = {
  gilthead_seabream: 'Çipura',
  european_seabass:  'Levrek',
  atlantic_salmon:   'Salmon',
  rainbow_trout:     'Alabalık',
  nile_tilapia:      'Tilapia',
};

console.log('═══════════════════════════════════════════════════════════════════════════');
console.log(' FEEDNETICS-style inverse simulation: target-driven feeding plan');
console.log('═══════════════════════════════════════════════════════════════════════════');
console.log('');

for (const input of examples) {
  const result = planFeeding(input);
  console.log(`▶ ${labels[input.species]}: ${input.W0}g → ${input.W_target}g in ${input.months} months @ T=${input.T_avg}°C, waste=${input.waste*100}%`);
  console.log(`  Süre: ${result.days} gün`);
  console.log(`  Hedef SGR: ${result.target_SGR.toFixed(2)}%/gün, TGC: ${result.target_TGC.toFixed(2)}`);
  console.log(`  Feasibility: ${result.feasible ? '✓ MÜMKÜN' : '✗ İMKANSIZ (' + result.violations.length + ' gün max FI üstünde)'}`);
  console.log(`  ${result.feasible ? 'Tahmin' : 'Hedef'} FCR: apparent=${result.FCR_apparent.toFixed(2)}, biological=${result.FCR_biological.toFixed(2)}`);
  console.log(`  Toplam yem (1 balık): ${(result.total_given/1000).toFixed(2)} kg verilecek (${(result.total_consumed/1000).toFixed(2)} kg yenir)`);
  console.log(`  Toplam yem (${input.N} balık): ${(result.total_given*input.N/1e6).toFixed(2)} ton`);
  console.log('');
  console.log('  Aylık yemleme programı (per balık):');
  console.log('  ───────────────────────────────────────────────────────');
  console.log('   Gün │ BW (g) │ Yem-yenecek │ %BW/d │ Yem-verilecek │ Max FI');
  console.log('  ─────┼────────┼─────────────┼───────┼───────────────┼────────');
  for (const t of result.trajectory) {
    const overflow = t.fi_required > t.fi_max ? '✗' : ' ';
    console.log(`   ${t.day.toString().padEnd(3)} │ ${t.bw.toFixed(0).padStart(6)} │ ${t.fi_required.toFixed(2).padStart(11)} │ ${t.ration_pct.toFixed(2).padStart(5)}% │ ${t.give.toFixed(2).padStart(13)} │ ${t.fi_max.toFixed(2).padStart(6)} ${overflow}`);
  }
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('');
}
