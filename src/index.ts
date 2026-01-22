/**
 * FEEDNETICS Model - Main Entry Point
 *
 * A mechanistic nutrient-based model for precision fish farming
 *
 * Based on: Soares et al. (2023) "Development and Application of a
 * Mechanistic Nutrient-Based Model for Precision Fish Farming"
 * Journal of Marine Science and Engineering, 11, 472.
 * https://doi.org/10.3390/jmse11030472
 *
 * Model Components:
 * - Feed Intake Control (A.1-A.3)
 * - Gut Compartment: Digestion & Absorption (A.4-A.8)
 * - Body Weight & Composition (A.9-A.11)
 * - Energetic Model: ATP Balance (A.12-A.18)
 * - Nitrogen Metabolism (A.19-A.42)
 * - Carbon Metabolism (A.43-A.46)
 * - Calibration Metrics (1-4)
 * - Performance Indicators (RGR, SGR, FCR, etc.)
 */

// Export all types
export * from './types';

// Export all formula modules
export * from './formulas';
