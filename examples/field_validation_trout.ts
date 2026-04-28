/**
 * Field validation: rainbow trout grow-out scenario
 *
 * Real-world data from a commercial trout farm:
 *   - Initial weight: 300 g
 *   - Target weight:  1800 g
 *   - Duration:       180 days (6 months)
 *   - Apparent FCR:   1.5 (feed given / weight gain)
 *   - Feed waste:     ~10% (uneaten pellets in net pen)
 *
 * Derived metrics:
 *   - Total feed given:    2250 g/fish
 *   - Total feed consumed: 2025 g/fish
 *   - Biological FCR:      1.35
 *   - Required SGR:        1.00 %/day
 *
 * The scenario stress-tests the trout feedIntake parameters and produces
 * a daily feeding chart for farm use.
 */

import { getSpeciesParams } from '../src';

const W0 = 300, W_target = 1800, days = 180;
const FCR_apparent = 1.5;
const waste_fraction = 0.10;
const FCR_biological = FCR_apparent * (1 - waste_fraction);  // 1.35
const T = 15;  // typical Turkish trout farm operating temperature

const trout = getSpeciesParams('rainbow_trout');
const fi = trout.feedIntake;

console.log('═══════════════════════════════════════════════════════════════════════');
console.log(' Field validation: Rainbow trout 300g → 1800g in 6 months');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('');
console.log(`Field input:    apparent FCR=${FCR_apparent}, waste=${waste_fraction*100}%, T=${T}°C`);
console.log(`Targets:        W_final=1800g, total feed given=2250g, bio FCR=${FCR_biological.toFixed(2)}`);
console.log('');

// Run model simulation with biological FCR
let bw = W0;
let total_consumed = 0;
const trajectory: { day: number, bw: number, fi: number, give: number }[] = [];
for (let d = 0; d <= days; d++) {
  const FI = fi.a * Math.pow(bw, fi.b) * Math.exp(fi.c * T);
  const give = FI / (1 - waste_fraction);
  if (d % 30 === 0) trajectory.push({ day: d, bw, fi: FI, give });
  if (d < days) {
    total_consumed += FI;
    bw += FI / FCR_biological;
  }
}
const total_given = total_consumed / (1 - waste_fraction);

console.log('Model prediction (current trout calibration):');
console.log(`  Final BW            = ${bw.toFixed(0)} g`);
console.log(`  Total feed consumed = ${total_consumed.toFixed(0)} g`);
console.log(`  Total feed given    = ${total_given.toFixed(0)} g`);
console.log(`  Apparent FCR        = ${(total_given / (bw - W0)).toFixed(2)}`);
console.log(`  Biological FCR      = ${(total_consumed / (bw - W0)).toFixed(2)}`);
console.log(`  SGR                 = ${(100 * (Math.log(bw) - Math.log(W0)) / days).toFixed(2)}%/d`);
console.log('');

// Daily feeding chart (monthly)
console.log('Monthly feeding chart (per fish, T=15°C):');
console.log('');
console.log('  Day │ BW (g) │ FI eaten (g/d) │ %BW/d  │ Feed given (g/d, +waste)');
console.log('  ────┼────────┼────────────────┼────────┼──────────────────────────');
for (const row of trajectory) {
  const pct = (row.fi / row.bw * 100);
  console.log(`  ${row.day.toString().padEnd(3)} │ ${row.bw.toFixed(0).padStart(6)} │ ${row.fi.toFixed(2).padStart(13)} │ ${pct.toFixed(2).padStart(5)}% │ ${row.give.toFixed(2).padStart(13)} g/d`);
}
console.log('');

// Per 1000-fish summary
const N = 1000;
console.log(`For ${N} fish over ${days} days:`);
console.log(`  Total feed needed   = ${(total_given * N / 1000).toFixed(0)} kg`);
console.log(`  Total weight gain   = ${((bw - W0) * N / 1000).toFixed(0)} kg`);
console.log(`  Apparent FCR        = ${(total_given / (bw - W0)).toFixed(2)}`);
console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
