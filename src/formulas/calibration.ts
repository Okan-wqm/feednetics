/**
 * FEEDNETICS Model - Calibration and Validation Metrics
 * Equations (1) - (4)
 */

export interface ObservedPredicted {
  observed: number;
  predicted: number;
}

/**
 * Equation (1) & (4): Mean Absolute Percentage Error (MAPE)
 *
 * MAPE(%) = (100/n) × Σ|P_i - O_i| / |O_i|
 *
 * @param data Array of observed-predicted pairs
 * @returns MAPE in percentage
 */
export function calculateMAPE(data: ObservedPredicted[]): number {
  const n = data.length;
  if (n === 0) return 0;

  const sumAbsPercentError = data.reduce((sum, { observed, predicted }) => {
    if (observed === 0) return sum;
    return sum + Math.abs((predicted - observed) / observed);
  }, 0);

  return (100 / n) * sumAbsPercentError;
}

/**
 * Equation (2): Cumulative Absolute Error (CAE)
 *
 * CAE(g) = Σ|P_i - O_i|
 *
 * @param data Array of observed-predicted pairs
 * @returns CAE in grams
 */
export function calculateCAE(data: ObservedPredicted[]): number {
  return data.reduce((sum, { observed, predicted }) => {
    return sum + Math.abs(predicted - observed);
  }, 0);
}

/**
 * Equation (3): Crude Lipids Weighted Error (WE_CL)
 *
 * WE_CL = (1/m) × Σ(CL_ref - CL_predicted)² × 0.1
 *
 * @param clRef Reference crude lipids values (%)
 * @param clPredicted Predicted crude lipids values (%)
 * @returns Weighted error
 */
export function calculateWE_CL(clRef: number[], clPredicted: number[]): number {
  const m = clRef.length;
  if (m === 0 || m !== clPredicted.length) return 0;

  const sumSquaredError = clRef.reduce((sum, ref, i) => {
    const diff = ref - clPredicted[i];
    return sum + (diff * diff);
  }, 0);

  return (1 / m) * sumSquaredError * 0.1;
}

/**
 * Combined objective function for calibration
 * Minimizes: MAPE + CAE + WE_CL
 */
export function calibrationObjective(
  bodyWeightData: ObservedPredicted[],
  clRef: number[],
  clPredicted: number[]
): number {
  const mape = calculateMAPE(bodyWeightData);
  const cae = calculateCAE(bodyWeightData);
  const weCL = calculateWE_CL(clRef, clPredicted);

  // Normalized combination (weights can be adjusted)
  return mape + cae + weCL;
}
