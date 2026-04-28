/**
 * FEEDNETICS Calibration Simulation Suite
 *
 * Runs five scenarios that exercise the calibrated SpeciesParams against
 * published growth and metabolism data:
 *
 *   1. Basal metabolism — FM_E and FM_P at species T_optimal
 *   2. Maximum feed intake (Lupatsch model)
 *   3. 90-day growth trajectory from initial 50 g
 *   4. Performance indicators (SGR, TGC, DWG)
 *   5. Validation against published SGR ranges per species
 *
 * Run: npx ts-node examples/run_simulation.ts
 *      or: tsc && node dist/examples/run_simulation.js
 */

import { getSpeciesParams, FishSpecies } from '../src';

const species: FishSpecies[] = [
  'gilthead_seabream', 'european_seabass', 'atlantic_salmon',
  'rainbow_trout', 'nile_tilapia',
];

const labels: Record<FishSpecies, string> = {
  gilthead_seabream: 'Çipura',
  european_seabass:  'Levrek',
  atlantic_salmon:   'Salmon',
  rainbow_trout:     'Alabalık',
  nile_tilapia:      'Tilapia',
};

const refT: Record<FishSpecies, number> = {
  gilthead_seabream: 22, european_seabass: 22,
  atlantic_salmon: 13, rainbow_trout: 15, nile_tilapia: 28,
};

// Published SGR ranges from primary literature (50-100g fish at T_optimal)
const publishedSGR: Record<FishSpecies, [number, number, string]> = {
  gilthead_seabream: [1.0, 1.8, 'Lupatsch et al. 2003'],
  european_seabass:  [0.9, 1.6, 'Lupatsch & Kissil 2001'],
  atlantic_salmon:   [0.8, 1.5, 'Bureau & Cho salmonid review'],
  rainbow_trout:     [0.7, 1.5, 'Bureau, Hua & Cho 2006'],
  nile_tilapia:      [1.2, 2.5, 'Lupatsch 2010 / Chowdhury 2013'],
};

// Typical commercial FCR per species
const fcrTarget: Record<FishSpecies, number> = {
  gilthead_seabream: 1.7, european_seabass: 1.6,
  atlantic_salmon: 1.1, rainbow_trout: 1.2, nile_tilapia: 1.5,
};

const hr = '═══════════════════════════════════════════════════════════════════════════';

// ─── Scenario 1: Basal metabolism ──────────────────────────────────────
console.log(hr);
console.log(' SCENARIO 1 — Basal metabolism (FM_E, FM_P) at species T_optimal');
console.log(hr);
console.log('');
console.log('  BW   T    │ Çipura  Levrek  Salmon  Alabalık Tilapia │ unit');
console.log('  ───────────┼─────────────────────────────────────────────┼──────────');
for (const BW of [10, 50, 100, 500, 1000]) {
  let row_E = `  ${BW.toString().padEnd(4)} T_op │`;
  for (const s of species) {
    const p = getSpeciesParams(s);
    const T = refT[s];
    const e = p.energyMetabolism;
    const FM_E = e.basalATP_a * Math.pow(BW, e.basalATP_b) * Math.exp(e.basalATP_c * T);
    row_E += ` ${FM_E.toFixed(2).padStart(7)}`;
  }
  console.log(`${row_E} │ kJ/d`);
}

// ─── Scenario 2: Max feed intake ────────────────────────────────────────
console.log('');
console.log(hr);
console.log(' SCENARIO 2 — Maximum feed intake (FI = a·BW^b·exp(c·T))');
console.log(hr);
console.log('');
console.log('  BW    │ Çipura  Levrek  Salmon  Alabalık Tilapia │ unit');
console.log('  ──────┼─────────────────────────────────────────────┼─────────');
for (const BW of [10, 50, 100, 500, 1000]) {
  let row_FI = `  ${BW.toString().padEnd(5)} │`;
  let row_pct = `  %BW   │`;
  for (const s of species) {
    const p = getSpeciesParams(s);
    const T = refT[s];
    const fi = p.feedIntake;
    const FI = fi.a * Math.pow(BW, fi.b) * Math.exp(fi.c * T);
    row_FI  += ` ${FI.toFixed(3).padStart(7)}`;
    row_pct += ` ${(FI/BW*100).toFixed(2).padStart(6)}%`;
  }
  console.log(`${row_FI} │ g feed/d`);
  if (BW === 100) console.log(`${row_pct} │ %BW/d (100g)`);
}

// ─── Scenario 3: 90-day growth trajectory ──────────────────────────────
console.log('');
console.log(hr);
console.log(' SCENARIO 3 — 90-day growth trajectory (initial 50g, T_optimal)');
console.log(' Method: dBW/dt = max_feed_intake / FCR_target  (Lupatsch ration model)');
console.log(hr);
console.log('');

const trajectories: Record<FishSpecies, number[]> = Object.fromEntries(
  species.map(s => [s, [50]])
) as Record<FishSpecies, number[]>;

for (let day = 0; day < 90; day++) {
  for (const s of species) {
    const p = getSpeciesParams(s);
    const T = refT[s];
    const BW = trajectories[s][day];
    const fi = p.feedIntake;
    const FI = fi.a * Math.pow(BW, fi.b) * Math.exp(fi.c * T);
    const growth = FI / fcrTarget[s];
    trajectories[s].push(BW + growth);
  }
}

console.log('  Day │ Çipura  Levrek  Salmon  Alabalık Tilapia');
console.log('  ────┼─────────────────────────────────────────────');
for (const day of [0, 15, 30, 45, 60, 75, 90]) {
  let row = `  ${day.toString().padEnd(3)} │`;
  for (const s of species) {
    row += ` ${trajectories[s][day].toFixed(1).padStart(7)}`;
  }
  console.log(`${row} │ g`);
}

// ─── Scenario 4: Performance indicators ────────────────────────────────
console.log('');
console.log(hr);
console.log(' SCENARIO 4 — Performance indicators');
console.log(hr);
console.log('');
const sgr = (s: FishSpecies) =>
  100 * (Math.log(trajectories[s][90]) - Math.log(trajectories[s][0])) / 90;
const tgc = (s: FishSpecies) =>
  1000 * (Math.pow(trajectories[s][90], 1/3) - Math.pow(trajectories[s][0], 1/3)) / (refT[s] * 90);

console.log('  Metric          │ Çipura  Levrek  Salmon  Alabalık Tilapia');
console.log('  ─────────────────┼─────────────────────────────────────────────');
for (const [name, fn, unit] of [
  ['SGR             ', sgr, '%/d'],
  ['W_final         ', (s: FishSpecies) => trajectories[s][90], 'g'],
  ['TGC             ', tgc, '-'],
  ['DWG             ', (s: FishSpecies) => (trajectories[s][90] - 50) / 90, 'g/d'],
] as const) {
  let row = `  ${name} │`;
  for (const s of species) {
    row += ` ${(fn as (sp: FishSpecies) => number)(s).toFixed(2).padStart(7)}`;
  }
  console.log(`${row} │ ${unit}`);
}

// ─── Scenario 5: Validation ────────────────────────────────────────────
console.log('');
console.log(hr);
console.log(' SCENARIO 5 — Validation against published SGR ranges');
console.log(hr);
console.log('');
let pass = 0;
for (const s of species) {
  const sgr_v = sgr(s);
  const [lo, hi, ref] = publishedSGR[s];
  const in_range = sgr_v >= lo && sgr_v <= hi;
  if (in_range) pass++;
  const flag = in_range ? '✓ in range' : '✗ out of range';
  console.log(`  ${labels[s].padEnd(10)} predicted ${sgr_v.toFixed(2)}%/d  vs  published ${lo}-${hi}%/d  ${flag}`);
  console.log(`  ${' '.repeat(10)}   ref: ${ref}`);
}
console.log('');
console.log(`  Result: ${pass}/${species.length} species within published SGR range`);
console.log('');
console.log(hr);
