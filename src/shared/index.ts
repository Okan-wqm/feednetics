/**
 * FEEDNETICS Shared Variables Module
 *
 * Bu modül, modelde birden fazla yerde kullanılan
 * ortak değişkenleri ve sabitleri dışa aktarır.
 */

export {
  // Sabitler
  ModelConstants,
  ATPStoichiometryAA,
  ATPStoichiometryFA,

  // Durum Değişkenleri
  BodyCompositionState,
  RibosomeState,

  // Kontrol Değişkenleri
  ControlVariables,

  // ATP Değişkenleri
  ATPBalance,

  // Hız Değişkenleri
  ProteinRates,
  OxidationRates,
  CarbonRates,

  // Valf Değişkenleri
  MetabolicValves,

  // Referans Değerleri
  ReferenceValues,

  // Birleşik Durum
  FeedneticsState,

  // Default export
  default as SharedVariables
} from './SharedVariables';
