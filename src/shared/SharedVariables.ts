/**
 * FEEDNETICS Model - Shared Variables Classes
 *
 * Bu dosya modelde birden fazla denklemde kullanılan
 * ortak değişkenleri class yapısında tanımlar.
 *
 * Kaynak: Soares et al. (2023). J. Mar. Sci. Eng., 11, 472.
 */

import { AminoAcidId, FattyAcidId, AA_MOLECULAR_WEIGHTS } from '../types';

// ============================================================================
// 1. SABITLER (Constants)
// ============================================================================

/**
 * Model Sabitleri
 * Tüm türler için geçerli sabit değerler
 */
export class ModelConstants {
  /** Model zaman adımı (gün) - ~14.4 dakika */
  static readonly TIMESTEP = 0.01;

  /** Maksimum ATP harcaması (mol/g/saat) */
  static readonly MAX_ATP_EXPENDITURE = 600e-6;

  /** Yağsız kütledeki su oranı */
  static readonly WATER_FRACTION = 0.70;

  /** Vücut ağırlığındaki kül oranı */
  static readonly ASH_FRACTION = 0.03;

  /** Glukoz oksidasyonundan ATP (mol ATP / mol glukoz) */
  static readonly ATP_PER_GLUCOSE = 32;

  /** Glukoz başına palmitat (lipogenez) */
  static readonly GLUCOSE_PER_PALMITATE = 4;
}

/**
 * Amino Asit ATP Stokiyometrisi
 * Denklem A.15, A.16'da kullanılır
 */
export class ATPStoichiometryAA {
  static readonly values: Record<AminoAcidId, number> = {
    Ala: 13, Arg: 25, Asn: 16, Asp: 15, Cys: 12,
    Gln: 18, Glu: 18, Gly: 6,  His: 17, Ile: 30,
    Leu: 32, Lys: 28, Met: 20, Phe: 34, Pro: 22,
    Ser: 12, Thr: 16, Trp: 36, Tyr: 34, Val: 26
  };

  /**
   * Profil bazlı ortalama ATP stokiyometrisi hesapla
   * @param profile AA profili (her AA'nın oranı)
   * @returns mol ATP / g AA
   */
  static calculateWeightedAverage(profile: Record<AminoAcidId, number>): number {
    let totalATP = 0;
    let totalMass = 0;

    for (const aa of Object.keys(profile) as AminoAcidId[]) {
      const fraction = profile[aa] || 0;
      const atpPerMol = this.values[aa] || 15;
      const mw = AA_MOLECULAR_WEIGHTS[aa] || 110;

      totalATP += fraction * atpPerMol;
      totalMass += fraction * mw;
    }

    return totalMass > 0 ? totalATP / totalMass : 0.15;
  }
}

/**
 * Yağ Asidi ATP Stokiyometrisi
 * Denklem A.15, A.16, A.18'de kullanılır
 */
export class ATPStoichiometryFA {
  static readonly values: Record<string, number> = {
    'C14:0': 92,    // Miristik asit
    'C16:0': 106,   // Palmitik asit
    'C16:1': 104,   // Palmitoleik asit
    'C18:0': 120,   // Stearik asit
    'C18:1': 118,   // Oleik asit
    'C18:2': 116,   // Linoleik asit
    'C18:3': 114,   // Linolenik asit
    'C20:4': 126,   // Araşidonik asit
    'C20:5': 124,   // EPA
    'C22:6': 134,   // DHA
  };

  /** Yağ asidi moleküler ağırlıkları (g/mol) */
  static readonly molecularWeights: Record<string, number> = {
    'C14:0': 228.37,
    'C16:0': 256.42,
    'C16:1': 254.41,
    'C18:0': 284.48,
    'C18:1': 282.46,
    'C18:2': 280.45,
    'C18:3': 278.43,
    'C20:4': 304.47,
    'C20:5': 302.45,
    'C22:6': 328.49,
  };

  /**
   * Profil bazlı ortalama ATP stokiyometrisi hesapla
   * @param profile FA profili (her FA'nın oranı)
   * @returns mol ATP / g FA
   */
  static calculateWeightedAverage(profile: Record<FattyAcidId, number>): number {
    let totalATP = 0;
    let totalMass = 0;

    for (const fa of Object.keys(profile)) {
      const fraction = profile[fa] || 0;
      const atpPerMol = this.values[fa] || 106;
      const mw = this.molecularWeights[fa] || 280;

      totalATP += fraction * atpPerMol;
      totalMass += fraction * mw;
    }

    return totalMass > 0 ? totalATP / totalMass : 0.38;
  }
}

// ============================================================================
// 2. DURUM DEĞİŞKENLERİ (State Variables)
// ============================================================================

/**
 * Vücut Kompozisyonu Durumu
 * Denklem A.9, A.10, A.11'de kullanılır
 */
export class BodyCompositionState {
  /** Proteine bağlı amino asitler (mol) */
  proteinAA: Record<AminoAcidId, number>;

  /** Serbest amino asitler (mol) */
  freeAA: Record<AminoAcidId, number>;

  /** Vücut TAG deposu (mol) */
  TAG_body: Record<FattyAcidId, number>;

  /** Kan TAG seviyesi (mol) */
  TAG_blood: Record<FattyAcidId, number>;

  /** Glikojen (mol) */
  glycogen: number;

  /** Kan glikozu (mol) */
  glucose: number;

  constructor(initial?: Partial<BodyCompositionState>) {
    this.proteinAA = initial?.proteinAA || this.createEmptyAARecord();
    this.freeAA = initial?.freeAA || this.createEmptyAARecord();
    this.TAG_body = initial?.TAG_body || {};
    this.TAG_blood = initial?.TAG_blood || {};
    this.glycogen = initial?.glycogen || 0;
    this.glucose = initial?.glucose || 0;
  }

  private createEmptyAARecord(): Record<AminoAcidId, number> {
    const record = {} as Record<AminoAcidId, number>;
    const aas: AminoAcidId[] = [
      'Ala', 'Arg', 'Asn', 'Asp', 'Cys', 'Gln', 'Glu', 'Gly', 'His', 'Ile',
      'Leu', 'Lys', 'Met', 'Phe', 'Pro', 'Ser', 'Thr', 'Trp', 'Tyr', 'Val'
    ];
    for (const aa of aas) {
      record[aa] = 0;
    }
    return record;
  }

  /**
   * Toplam protein hesapla (A.9)
   * protein_total = Σ protein_AA_i × MW_i
   */
  get proteinTotal(): number {
    let total = 0;
    for (const aa of Object.keys(this.proteinAA) as AminoAcidId[]) {
      const moles = this.proteinAA[aa] || 0;
      const mw = AA_MOLECULAR_WEIGHTS[aa] || 110;
      total += moles * mw;
    }
    return total;
  }

  /**
   * Toplam lipid hesapla (A.10)
   * lipid_total = Σ (TAG_body + TAG_blood) × MW_i
   */
  get lipidTotal(): number {
    let total = 0;
    const allFAs = new Set([
      ...Object.keys(this.TAG_body),
      ...Object.keys(this.TAG_blood)
    ]);

    for (const fa of allFAs) {
      const bodyMoles = this.TAG_body[fa] || 0;
      const bloodMoles = this.TAG_blood[fa] || 0;
      const mw = ATPStoichiometryFA.molecularWeights[fa] || 280;
      total += (bodyMoles + bloodMoles) * mw;
    }
    return total;
  }

  /**
   * Toplam serbest AA hesapla
   */
  get freeAATotal(): number {
    let total = 0;
    for (const aa of Object.keys(this.freeAA) as AminoAcidId[]) {
      const moles = this.freeAA[aa] || 0;
      const mw = AA_MOLECULAR_WEIGHTS[aa] || 110;
      total += moles * mw;
    }
    return total;
  }

  /**
   * Vücut ağırlığı hesapla
   */
  get bodyWeight(): number {
    const protein = this.proteinTotal;
    const lipid = this.lipidTotal;
    const glycogenMass = this.glycogen * 162; // Glukoz MW
    const leanMass = protein + glycogenMass;
    const water = leanMass * ModelConstants.WATER_FRACTION;
    const dryMass = protein + lipid + glycogenMass;
    const totalWithWater = dryMass + water;
    const ash = totalWithWater * ModelConstants.ASH_FRACTION / (1 - ModelConstants.ASH_FRACTION);

    return protein + lipid + glycogenMass + water + ash;
  }
}

/**
 * Ribozom Durumu
 * Denklem A.21-A.26'da kullanılır
 */
export class RibosomeState {
  /** Meşgul ribozomlar */
  occupied: number;

  /** Boş ribozomlar */
  unoccupied: number;

  constructor(occupied: number = 0.5, unoccupied: number = 0.5) {
    this.occupied = occupied;
    this.unoccupied = unoccupied;
  }

  /**
   * Ribozom aktivitesi (A.25)
   * ribo_act = ribo_unoccupied / (ribo_occupied + ribo_unoccupied)
   */
  get activity(): number {
    const total = this.occupied + this.unoccupied;
    if (total <= 0) return 0.5;
    return this.unoccupied / total;
  }

  /**
   * Ribozom durumunu güncelle (A.23, A.24)
   */
  update(activation: number, deactivation: number, dt: number): void {
    const dOccupied = deactivation - activation;
    const dUnoccupied = activation - deactivation;

    this.occupied = Math.max(0, this.occupied + dOccupied * dt);
    this.unoccupied = Math.max(0, this.unoccupied + dUnoccupied * dt);
  }
}

// ============================================================================
// 3. KONTROL DEĞİŞKENLERİ (Control Variables)
// ============================================================================

/**
 * Kontrol Değişkenleri
 * Metabolizmayı yöneten ana kontrol değişkenleri
 */
export class ControlVariables {
  /** Su sıcaklığı (°C) */
  temperature: number;

  /** Beslenme durumu [0=aç, 1=tok] */
  fedScaling: number;

  /** Açlık durumu [0=normal, 1=açlık] */
  starving: number;

  /** Referans lipid seviyesi (g) */
  private _lipidRef: number;

  /** CL_q shape parametresi */
  private _beta: number;

  constructor(
    temperature: number = 20,
    fedScaling: number = 0,
    starving: number = 0,
    lipidRef: number = 10,
    beta: number = 2
  ) {
    this.temperature = temperature;
    this.fedScaling = fedScaling;
    this.starving = starving;
    this._lipidRef = lipidRef;
    this._beta = beta;
  }

  /**
   * CL_q hesapla (A.11)
   * CL_q = 1 / (1 + (lipid_ref / lipid_total)^β)
   *
   * @param lipidTotal Mevcut toplam lipid (g)
   */
  calculateCL_q(lipidTotal: number): number {
    if (lipidTotal <= 0) return 0;
    if (this._lipidRef <= 0) return 1;

    const ratio = this._lipidRef / lipidTotal;
    return 1 / (1 + Math.pow(ratio, this._beta));
  }

  /**
   * Protein sentez regülatörü hesapla (A.27)
   * prot_synt_regulator = 0.05 + 0.95 × min(1, max(0, CL_q + fed - starving))
   */
  calculateProtSyntRegulator(CL_q: number): number {
    const value = CL_q + this.fedScaling - this.starving;
    const clamped = Math.min(1, Math.max(0, value));
    return 0.05 + 0.95 * clamped;
  }

  /** Lipid referans değerini güncelle */
  setLipidRef(value: number): void {
    this._lipidRef = value;
  }

  /** Beta parametresini güncelle */
  setBeta(value: number): void {
    this._beta = value;
  }

  get lipidRef(): number {
    return this._lipidRef;
  }

  get beta(): number {
    return this._beta;
  }
}

// ============================================================================
// 4. ATP DEĞİŞKENLERİ (ATP Variables)
// ============================================================================

/**
 * ATP Dengesi
 * Denklem A.12-A.18'de kullanılır
 */
export class ATPBalance {
  /** Anabolik ATP maliyeti (mol/gün) */
  costAnabolic: number = 0;

  /** Bazal ATP maliyeti (mol/gün) */
  costBasal: number = 0;

  /** Katabolik ATP üretimi (mol/gün) */
  prodCatabolic: number = 0;

  /** Glukoz oksidasyonundan ATP (mol/gün) */
  prodGlucoseOx: number = 0;

  /** AA oksidasyonundan ATP (mol/gün) */
  prodAAOx: number = 0;

  /** FA oksidasyonundan ATP (mol/gün) */
  prodFAOx: number = 0;

  /**
   * Toplam ATP harcaması (A.12)
   * ATP_exp = ATP_cost_anab + (1 + fed × SDA) × ATP_cost_basal
   */
  calculateExpenditure(fedScaling: number, feedCostScale: number): number {
    return this.costAnabolic + (1 + fedScaling * feedCostScale) * this.costBasal;
  }

  /**
   * Oksidasyondan gereken ATP (A.13)
   * ATP_req = ATP_exp - ATP_prod_catab - ATP_prod_glucox
   */
  calculateRequired(expenditure: number): number {
    return Math.max(0, expenditure - this.prodCatabolic - this.prodGlucoseOx);
  }

  /**
   * Toplam üretilen ATP
   */
  get totalProduction(): number {
    return this.prodCatabolic + this.prodGlucoseOx + this.prodAAOx + this.prodFAOx;
  }

  /**
   * ATP dengesini sıfırla
   */
  reset(): void {
    this.costAnabolic = 0;
    this.costBasal = 0;
    this.prodCatabolic = 0;
    this.prodGlucoseOx = 0;
    this.prodAAOx = 0;
    this.prodFAOx = 0;
  }
}

// ============================================================================
// 5. HIZ DEĞİŞKENLERİ (Rate Variables)
// ============================================================================

/**
 * Protein Metabolizma Hızları
 * Denklem A.19-A.34'te kullanılır
 */
export class ProteinRates {
  /** Translasyon hızı (1/gün) */
  k_RNA: number = 0;

  /** Sıcaklık etkisi faktörü */
  vs_T: number = 0;

  /** Maksimum protein sentezi (g/gün) */
  maxSynthesis: number = 0;

  /** Gerçek protein sentezi (g/gün) */
  actualSynthesis: number = 0;

  /** Maksimum protein yıkımı (g/gün) */
  maxDegradation: number = 0;

  /** Minimum protein yıkımı (g/gün) */
  minDegradation: number = 0;

  /** Gerçek protein yıkımı (g/gün) */
  actualDegradation: number = 0;

  /**
   * k_RNA hesapla (A.26)
   * k_RNA = e^[(1-ribo_act) × ln(k_min) + ribo_act × ln(k_max)]
   */
  calculateKRNA(riboAct: number, k_min: number, k_max: number): number {
    const logMin = Math.log(k_min);
    const logMax = Math.log(k_max);
    const logK = (1 - riboAct) * logMin + riboAct * logMax;
    this.k_RNA = Math.exp(logK);
    return this.k_RNA;
  }

  /**
   * Sıcaklık etkisi hesapla (A.20)
   * vs_T = temperatureEffect × T
   */
  calculateTemperatureEffect(tempEffect: number, temperature: number): number {
    this.vs_T = tempEffect * temperature;
    return this.vs_T;
  }

  /**
   * Net protein değişimi
   * Büyüme = Sentez - Yıkım
   */
  get netChange(): number {
    return this.actualSynthesis - this.actualDegradation;
  }
}

/**
 * Oksidasyon Hızları
 * Denklem A.16-A.18, A.35-A.40'ta kullanılır
 */
export class OxidationRates {
  /** AA oksidasyon miktarı (g/gün) */
  m_ox_AA: number = 0;

  /** FA oksidasyon miktarı (g/gün) */
  m_ox_FA: number = 0;

  /** Minimum AA kaybı (g/gün) */
  min_AA_loss: number = 0;

  /**
   * AA oksidasyon miktarı hesapla (A.16)
   * m_ox_AA = ATP_req / [(CL_q/(1-CL_q)) × ATP_stoich_FA + ATP_stoich_AA]
   */
  calculateMassAAOxidized(
    ATP_req: number,
    CL_q: number,
    ATP_stoich_AA: number,
    ATP_stoich_FA: number
  ): number {
    if (CL_q >= 1) {
      this.m_ox_AA = 0;
      return 0;
    }
    if (CL_q <= 0) {
      this.m_ox_AA = ATP_stoich_AA > 0 ? ATP_req / ATP_stoich_AA : 0;
      return this.m_ox_AA;
    }

    const denominator = (CL_q / (1 - CL_q)) * ATP_stoich_FA + ATP_stoich_AA;
    this.m_ox_AA = denominator > 0 ? ATP_req / denominator : 0;
    return this.m_ox_AA;
  }

  /**
   * AA oksidasyonunu minimum ile sınırla (A.17)
   * m_ox_AA = max(calculated, min_AA_loss)
   */
  adjustForMinimumLoss(): number {
    this.m_ox_AA = Math.max(this.m_ox_AA, this.min_AA_loss);
    return this.m_ox_AA;
  }

  /**
   * FA oksidasyon miktarı hesapla (A.18)
   * m_ox_FA = (ATP_req - ATP_AA_ox) / ATP_stoich_FA
   */
  calculateMassFAOxidized(
    ATP_req: number,
    ATP_stoich_AA: number,
    ATP_stoich_FA: number
  ): number {
    const ATP_AA_ox = this.m_ox_AA * ATP_stoich_AA;
    const remaining = ATP_req - ATP_AA_ox;

    if (remaining <= 0 || ATP_stoich_FA <= 0) {
      this.m_ox_FA = 0;
    } else {
      this.m_ox_FA = remaining / ATP_stoich_FA;
    }
    return this.m_ox_FA;
  }

  /**
   * Minimum AA kaybı hesapla (A.35)
   * min_AA_loss = req_a × e^(req_b × T) × (BW/1000)^req_c
   */
  calculateMinAALoss(
    bodyWeight: number,
    temperature: number,
    req_a: number,
    req_b: number,
    req_c: number
  ): number {
    this.min_AA_loss = req_a * Math.exp(req_b * temperature) * Math.pow(bodyWeight / 1000, req_c);
    return this.min_AA_loss;
  }
}

/**
 * Karbon Metabolizma Hızları
 * Denklem A.41-A.46'da kullanılır
 */
export class CarbonRates {
  /** Glukoz oksidasyon hızı (mol/gün) */
  V_glucox: number = 0;

  /** Glukoneogenez hızı (mol/gün) */
  V_gluconeo: number = 0;

  /** Lipogenez hızı (mol/gün) */
  V_lipogen: number = 0;

  /** Glikojen turnover hızı (mol/gün) */
  V_glycogen: number = 0;

  /** Glikogenez hızı (mol/gün) */
  glycogenesis: number = 0;

  /** Glikojenoliz hızı (mol/gün) */
  glycogenolysis: number = 0;

  /**
   * Maksimum glukoz oksidasyonu hesapla (A.43)
   * V_max = min(a × BW × e^(b×T), glucose/timestep)
   */
  calculateMaxGlucoseOx(
    bodyWeight: number,
    temperature: number,
    glucose: number,
    timestep: number,
    a: number,
    b: number
  ): number {
    const enzymatic = a * bodyWeight * Math.exp(b * temperature);
    const substrate = timestep > 0 ? glucose / timestep : 0;
    return Math.min(enzymatic, substrate);
  }

  /**
   * Maksimum glikojen turnover hesapla (A.44)
   * V_max = k × protein_total
   */
  calculateMaxGlycogenTurnover(proteinTotal: number, k: number): number {
    this.V_glycogen = k * proteinTotal;
    return this.V_glycogen;
  }

  /**
   * Maksimum lipogenez hesapla (A.45)
   * V_max = min(a × BW × e^(b×T), glucose/timestep)
   */
  calculateMaxLipogenesis(
    bodyWeight: number,
    temperature: number,
    glucose: number,
    timestep: number,
    a: number,
    b: number
  ): number {
    const enzymatic = a * bodyWeight * Math.exp(b * temperature);
    const substrate = timestep > 0 ? glucose / timestep : 0;
    this.V_lipogen = Math.min(enzymatic, substrate);
    return this.V_lipogen;
  }

  /**
   * Net glikojen akısı
   */
  get netGlycogenFlux(): number {
    return this.glycogenesis - this.glycogenolysis;
  }
}

// ============================================================================
// 6. VALF DEĞİŞKENLERİ (Valve Variables)
// ============================================================================

/**
 * Metabolik Valfler
 * Sigmoid fonksiyonlarla hesaplanan [0, 1] aralığında değişkenler
 */
export class MetabolicValves {
  /** AA sentez valfi (A.28) */
  AA_synt_valv: number = 0;

  /** AA yıkım valfi (A.33) */
  AA_deg_valv: number = 0;

  /** AA oksidasyon valfleri (A.38) */
  AA_ox_valv: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;

  /** AA oksidasyon ağırlıkları (A.39) */
  AA_ox_weights: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;

  /**
   * AA sentez valfi hesapla (A.28)
   * valve = 1 / (1 + (ref/AA_free)^β)
   */
  calculateAASyntValve(AA_free: number, ref_AA_free: number, beta: number): number {
    if (AA_free <= 0 || ref_AA_free <= 0) {
      this.AA_synt_valv = 0;
      return 0;
    }

    const ratio = ref_AA_free / AA_free;
    this.AA_synt_valv = 1 / (1 + Math.pow(ratio, beta));
    return this.AA_synt_valv;
  }

  /**
   * AA yıkım valfi hesapla (A.33)
   * valve = [1 / (1 + (AA_free/ref)^β₂)]^β₁
   */
  calculateAADegValve(
    AA_free: number,
    ref_AA_free: number,
    beta_1: number,
    beta_2: number
  ): number {
    if (ref_AA_free <= 0) {
      this.AA_deg_valv = 0;
      return 0;
    }

    const ratio = AA_free / ref_AA_free;
    const inner = 1 / (1 + Math.pow(ratio, beta_2));
    this.AA_deg_valv = Math.min(1, Math.pow(inner, beta_1));
    return this.AA_deg_valv;
  }

  /**
   * AA oksidasyon valflerini hesapla (A.38, A.39)
   */
  calculateAAOxValves(
    freeAA: Record<AminoAcidId, number>,
    max_ref: Record<AminoAcidId, number>,
    min_ref: Record<AminoAcidId, number>
  ): void {
    const maxNorms: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;
    const minNorms: Record<AminoAcidId, number> = {} as Record<AminoAcidId, number>;
    let sumMaxNorm = 0;
    let sumMinNorm = 0;

    // Normalize et
    for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
      maxNorms[aa] = max_ref[aa] > 0 ? freeAA[aa] / max_ref[aa] : 0;
      minNorms[aa] = min_ref[aa] > 0 ? freeAA[aa] / min_ref[aa] : 0;
      sumMaxNorm += maxNorms[aa];
      sumMinNorm += minNorms[aa];
    }

    // Valfleri hesapla (A.38)
    let sumValves = 0;
    for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
      const maxFrac = sumMaxNorm > 0 ? maxNorms[aa] / sumMaxNorm : 0;
      const minFrac = sumMinNorm > 0 ? minNorms[aa] / sumMinNorm : 0;
      this.AA_ox_valv[aa] = Math.min(maxFrac, minFrac);
      sumValves += this.AA_ox_valv[aa];
    }

    // Ağırlıkları hesapla (A.39)
    for (const aa of Object.keys(freeAA) as AminoAcidId[]) {
      this.AA_ox_weights[aa] = sumValves > 0
        ? this.AA_ox_valv[aa] / sumValves
        : 1 / Object.keys(freeAA).length;
    }
  }
}

// ============================================================================
// 7. REFERANS DEĞERLERİ (Reference Values)
// ============================================================================

/**
 * Referans Değerleri
 * Valf hesaplamalarında kullanılan referans seviyeleri
 */
export class ReferenceValues {
  /** Referans lipid seviyesi (g) */
  lipidRef: number;

  /** Referans serbest AA (mol) */
  ref_AA_free: number;

  /** Maksimum referans AA (mol) */
  max_ref_AA_free: number;

  /** Minimum referans AA (mol) */
  min_ref_AA_free: number;

  /** Referans glukoz (mol) */
  ref_glucose: number;

  /** Referans glikojen (mol) */
  glycogenRef: number;

  constructor(params?: Partial<ReferenceValues>) {
    this.lipidRef = params?.lipidRef || 10;
    this.ref_AA_free = params?.ref_AA_free || 0.1;
    this.max_ref_AA_free = params?.max_ref_AA_free || 0.2;
    this.min_ref_AA_free = params?.min_ref_AA_free || 0.05;
    this.ref_glucose = params?.ref_glucose || 0.01;
    this.glycogenRef = params?.glycogenRef || 0.1;
  }

  /**
   * Vücut ağırlığına göre ölçekle
   */
  scaleToBodyWeight(bodyWeight: number, scaleFactor: number = 0.001): void {
    const scale = bodyWeight * scaleFactor;
    this.lipidRef *= scale;
    this.ref_AA_free *= scale;
    this.max_ref_AA_free *= scale;
    this.min_ref_AA_free *= scale;
    this.ref_glucose *= scale;
    this.glycogenRef *= scale;
  }
}

// ============================================================================
// 8. BİRLEŞİK MODEL DURUMU (Combined Model State)
// ============================================================================

/**
 * Tam Model Durumu
 * Tüm ortak değişkenleri tek bir sınıfta birleştirir
 */
export class FeedneticsState {
  /** Vücut kompozisyonu */
  composition: BodyCompositionState;

  /** Ribozom durumu */
  ribosome: RibosomeState;

  /** Kontrol değişkenleri */
  control: ControlVariables;

  /** ATP dengesi */
  atp: ATPBalance;

  /** Protein hızları */
  proteinRates: ProteinRates;

  /** Oksidasyon hızları */
  oxidationRates: OxidationRates;

  /** Karbon hızları */
  carbonRates: CarbonRates;

  /** Metabolik valfler */
  valves: MetabolicValves;

  /** Referans değerleri */
  references: ReferenceValues;

  /** Simülasyon zamanı (gün) */
  time: number = 0;

  constructor() {
    this.composition = new BodyCompositionState();
    this.ribosome = new RibosomeState();
    this.control = new ControlVariables();
    this.atp = new ATPBalance();
    this.proteinRates = new ProteinRates();
    this.oxidationRates = new OxidationRates();
    this.carbonRates = new CarbonRates();
    this.valves = new MetabolicValves();
    this.references = new ReferenceValues();
  }

  /**
   * Vücut ağırlığı
   */
  get bodyWeight(): number {
    return this.composition.bodyWeight;
  }

  /**
   * CL_q değeri
   */
  get CL_q(): number {
    return this.control.calculateCL_q(this.composition.lipidTotal);
  }

  /**
   * Net büyüme hızı (g/gün)
   */
  get netGrowthRate(): number {
    return this.proteinRates.netChange;
  }

  /**
   * Zamanı ilerlet
   */
  advanceTime(dt: number = ModelConstants.TIMESTEP): void {
    this.time += dt;
  }

  /**
   * Durumu JSON olarak dışa aktar
   */
  toJSON(): object {
    return {
      time: this.time,
      bodyWeight: this.bodyWeight,
      proteinTotal: this.composition.proteinTotal,
      lipidTotal: this.composition.lipidTotal,
      CL_q: this.CL_q,
      temperature: this.control.temperature,
      fedScaling: this.control.fedScaling,
      riboActivity: this.ribosome.activity,
      netGrowthRate: this.netGrowthRate
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ModelConstants,
  ATPStoichiometryAA,
  ATPStoichiometryFA,
  BodyCompositionState,
  RibosomeState,
  ControlVariables,
  ATPBalance,
  ProteinRates,
  OxidationRates,
  CarbonRates,
  MetabolicValves,
  ReferenceValues,
  FeedneticsState
};
