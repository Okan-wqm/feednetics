# FEEDNETICS Model - Variable Reference

> Frontend kullanımı için değişken referans dokümanı

## Table of Contents

1. [Input Variables (Girdi Değişkenleri)](#1-input-variables)
2. [State Variables (Durum Değişkenleri)](#2-state-variables)
3. [Parameters (Parametreler)](#3-parameters)
4. [Intermediate Variables (Ara Değişkenler)](#4-intermediate-variables)
5. [Output Variables (Çıktı Değişkenleri)](#5-output-variables)
6. [Constants (Sabitler)](#6-constants)
7. [Variable-Formula Matrix](#7-variable-formula-matrix)

---

## 1. Input Variables

### 1.1 Environmental Inputs

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `temperature` | number | °C | Su sıcaklığı | A.1, A.2, A.12, A.20, A.31, A.35, A.41, A.43, A.45 |
| `dailyAverage` | number | °C | Günlük ortalama sıcaklık | Input processing |
| `dailyAmplitude` | number | °C | Günlük sıcaklık genliği | Input processing |

### 1.2 Feed Inputs

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `feedGiven` | number | g/day | Verilen yem miktarı | A.3 |
| `crudeProtein` | number | % | Ham protein oranı | A.4 |
| `crudeLipids` | number | % | Ham yağ oranı | A.4 |
| `ash` | number | % | Kül oranı | Feed properties |
| `fiber` | number | % | Lif oranı | Feed properties |
| `grossEnergy` | number | MJ/kg | Brüt enerji | Feed properties |
| `phosphorus` | number | % | Fosfor oranı | Feed properties |

### 1.3 Digestibility Coefficients (ADC)

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `adc.crudeProtein` | number | 0-1 | Protein sindirilebilirlik katsayısı | A.4 |
| `adc.crudeLipids` | number | 0-1 | Yağ sindirilebilirlik katsayısı | A.4 |
| `adc.grossEnergy` | number | 0-1 | Enerji sindirilebilirlik katsayısı | A.4 |
| `adc.phosphorus` | number | 0-1 | Fosfor sindirilebilirlik katsayısı | A.4 |

### 1.4 Nutrient Profiles

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `aminoAcidProfile` | Record<AminoAcidId, number> | g/100g protein | Amino asit profili | A.15, A.40 |
| `fattyAcidProfile` | Record<FattyAcidId, number> | g/100g lipid | Yağ asiti profili | A.15, A.46 |

---

## 2. State Variables

### 2.1 Body State

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `bodyWeight` | number | g | Vücut ağırlığı | A.1, A.2, A.12, A.35, A.41, A.43, A.45 |
| `fedScaling` | number | 0-1 | Beslenme durumu | A.12, A.27 |
| `starving` | number | 0-1 | Açlık göstergesi | A.27 |

### 2.2 Gut Compartment State

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `digestible` | Record<string, number> | mol | Sindirilebilir besinler | A.5, A.7 |
| `digested` | Record<string, number> | mol | Sindirilmiş besinler | A.6, A.8 |
| `enzyme` | number | - | Enzim seviyesi | A.5, A.7 |
| `receptor` | number | - | Reseptör seviyesi | A.6, A.8 |

### 2.3 Body Composition State

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `proteinAA` | Record<AminoAcidId, number> | mol | Amino asit bazında protein | A.9 |
| `TAG_body` | Record<FattyAcidId, number> | mol | Vücut yağ asitleri (TAG) | A.10, A.46 |
| `TAG_blood` | Record<FattyAcidId, number> | mol | Kan yağ asitleri (TAG) | A.10 |
| `glycogen` | number | mol | Glikojen deposu | A.44 |
| `freeAA` | Record<AminoAcidId, number> | mol | Serbest amino asitler | A.28, A.33, A.36-A.42 |
| `glucose` | number | mol | Glukoz havuzu | A.42, A.43, A.44, A.45 |

### 2.4 Ribosome State

| Variable | Type | Unit | Description (TR) | Used In |
|----------|------|------|------------------|---------|
| `ribosome.occupied` | number | - | Meşgul ribozomlar | A.21, A.23, A.25 |
| `ribosome.unoccupied` | number | - | Boş ribozomlar | A.22, A.24, A.25 |

---

## 3. Parameters

### 3.1 Feed Intake Parameters (FeedIntakeParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `a` | number | - | Ölçekleme katsayısı | A.1, A.2 |
| `b` | number | - | Vücut ağırlığı üssü | A.1, A.2 |
| `c` | number | 1/°C | Sıcaklık katsayısı | A.1, A.2 |
| `T_low` | number | °C | Alt sıcaklık sınırı | A.1, A.2 |
| `T_high` | number | °C | Üst sıcaklık sınırı | A.1, A.2 |
| `beta` | number | - | Sigmoid şekil parametresi | A.2 |

### 3.2 Energy Metabolism Parameters (EnergyMetabolismParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `feedCostScale` | number | - | Beslenme maliyeti ölçeği | A.12 |
| `basalATP_a` | number | - | Bazal ATP katsayısı a | A.12 |
| `basalATP_b` | number | - | Bazal ATP üssü b | A.12 |
| `basalATP_c` | number | 1/°C | Bazal ATP sıcaklık katsayısı | A.12 |

### 3.3 Protein Metabolism Parameters (ProteinMetabolismParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `k_RNA_min` | number | - | Minimum translasyon hızı | A.26 |
| `k_RNA_max` | number | - | Maksimum translasyon hızı | A.26 |
| `C_s` | number | - | Transkripsiyon hızı | A.19 |
| `temperatureEffect` | number | 1/°C | Sıcaklık etkisi katsayısı | A.20 |
| `k_ribo` | number | 1/day | Ribozom hız sabiti | A.21, A.22 |
| `k_deg` | number | 1/day | Degradasyon hız sabiti | A.30 |
| `V_db` | number | - | Bazal degradasyon parametresi | A.31 |
| `V_dm` | number | - | Sıcaklık hassasiyeti parametresi | A.31 |
| `T_optimal` | number | °C | Optimal sıcaklık | A.31 |
| `protDegMinFactor` | number | - | Minimum degradasyon faktörü | A.32 |
| `AA_synt_beta` | number | - | AA sentez beta parametresi | A.28 |
| `AA_deg_beta_1` | number | - | AA degradasyon beta 1 | A.33 |
| `AA_deg_beta_2` | number | - | AA degradasyon beta 2 | A.33 |

### 3.4 AA Maintenance Parameters (AAMaintenanceParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `req_prot_a` | number | - | Protein ihtiyacı katsayısı a | A.35 |
| `req_prot_b` | number | 1/°C | Protein ihtiyacı katsayısı b | A.35 |
| `req_prot_c` | number | - | Protein ihtiyacı üssü c | A.35 |

### 3.5 Gluconeogenesis Parameters (GluconeogenesisParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `a_gluconeo` | number | - | Glukoneogenez katsayısı | A.41 |
| `b` | number | 1/°C | Sıcaklık katsayısı | A.41 |

### 3.6 Glucose Oxidation Parameters (GlucoseOxidationParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `a_glucox` | number | - | Glukoz oksidasyonu katsayısı | A.43 |
| `b` | number | 1/°C | Sıcaklık katsayısı | A.43 |

### 3.7 Lipogenesis Parameters (LipogenesisParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `a_lipogen` | number | - | Lipogenez katsayısı | A.45 |
| `b` | number | 1/°C | Sıcaklık katsayısı | A.45 |

### 3.8 Gut Kinetics Parameters (GutKinetics)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `k_digestion` | number | - | Sindirim hız sabiti | A.5 |
| `k_absorption` | number | - | Emilim hız sabiti | A.6 |
| `k_enz_prod` | number | - | Enzim üretim hızı | A.7 |
| `k_enz_deg` | number | - | Enzim degradasyon hızı | A.7 |
| `k_rec_prod` | number | - | Reseptör üretim hızı | A.8 |
| `k_rec_deg` | number | - | Reseptör degradasyon hızı | A.8 |

### 3.9 Glycogen Parameters (GlycogenParams)

| Parameter | Type | Unit | Description (TR) | Used In |
|-----------|------|------|------------------|---------|
| `k_glycogen` | number | - | Glikojen dönüşüm hız sabiti | A.44 |

---

## 4. Intermediate Variables

### 4.1 Feed Intake

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `FI_max` | number | g/day | Maksimum yem alımı | A.1, A.2 | A.3 |
| `FI` | number | g/day | Gerçek yem alımı | A.3 | A.4 |

### 4.2 Digestion

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `DI_nutrient` | number | mol/day | Sindirilebilir besin alımı | A.4 | A.5, A.7 |
| `digestion_rate` | number | mol/day | Sindirim hızı | A.5 | Gut state |
| `absorption_rate` | number | mol/day | Emilim hızı | A.6 | Gut state |

### 4.3 Body Composition

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `protein_total` | number | g | Toplam protein | A.9 | A.19, A.30, A.44 |
| `lipid_total` | number | g | Toplam lipit | A.10 | A.11 |
| `CL_q` | number | 0-1 | Ham lipit kontrol değişkeni | A.11 | A.14, A.16, A.17, A.27, A.45 |
| `lipid_ref` | number | g | Referans lipit seviyesi | Interpolation | A.11 |

### 4.4 Energy Balance

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `ATP_exp` | number | mol/day | ATP harcaması | A.12 | A.13 |
| `ATP_cost_anab` | number | mol/day | Anabolik ATP maliyeti | Anabolic reactions | A.12 |
| `ATP_cost_basal` | number | mol/day | Bazal ATP maliyeti | A.12 | A.12 |
| `ATP_prod_catab` | number | mol/day | Katabolik ATP üretimi | Catabolic reactions | A.13 |
| `ATP_prod_glucox` | number | mol/day | Glukoz oksidasyonundan ATP | A.43 | A.13 |
| `ATP_req` | number | mol/day | Gerekli ATP (oksidasyondan) | A.13 | A.15, A.16, A.18 |
| `ATP_stoich_AA` | number | mol ATP/g | AA oksidasyonu ATP verimi | Profile calc | A.15, A.16 |
| `ATP_stoich_FA` | number | mol ATP/g | FA oksidasyonu ATP verimi | Profile calc | A.15, A.16, A.18 |
| `m_ox_AA` | number | g/day | Oksidize edilen AA kütlesi | A.16, A.17 | A.18, A.40 |
| `m_ox_FA` | number | g/day | Oksidize edilen FA kütlesi | A.18 | A.14, A.46 |
| `ATP_AA_ox` | number | mol/day | AA oksidasyonundan ATP | Calculation | A.18 |

### 4.5 Protein Synthesis

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `vs_T` | number | - | Sıcaklık etkisi faktörü | A.20 | A.19 |
| `k_RNA` | number | - | Translasyon hızı | A.26 | A.19 |
| `lim_prot_synth` | number | g/day | Substrat limitli sentez | AA availability | A.19 |
| `max_prot_synth` | number | g/day | Maksimum protein sentezi | A.19 | A.29 |
| `ribo_activation` | number | - | Ribozom aktivasyonu | A.21 | A.23 |
| `ribo_deactivation` | number | - | Ribozom deaktivasyonu | A.22 | A.24 |
| `ribo_act` | number | 0-1 | Ribozom aktivitesi | A.25 | A.26 |
| `prot_synt_regulator` | number | 0.05-1 | Sentez regülatörü | A.27 | A.29 |
| `AA_synt_valv` | number | 0-1 | AA sentez valfi | A.28 | A.29 |
| `A_prot_synth` | number | g/day | Gerçek protein sentezi | A.29 | State update |

### 4.6 Protein Degradation

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `deg_temp_factor` | number | - | Degradasyon sıcaklık faktörü | A.31 | A.30 |
| `max_prot_deg` | number | g/day | Maksimum protein degradasyonu | A.30 | A.34 |
| `min_prot_deg` | number | g/day | Minimum protein degradasyonu | A.32 | A.34 |
| `AA_deg_valv` | number | 0-1 | AA degradasyon valfi | A.33 | A.34 |
| `prot_deg` | number | g/day | Gerçek protein degradasyonu | A.34 | State update |

### 4.7 AA Oxidation

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `min_AA_loss` | number | g/day | Minimum AA kaybı | A.35 | A.17, A.32 |
| `AA_free_max_norm` | number | - | Normalize serbest AA (max) | A.36 | A.38 |
| `AA_free_min_norm` | number | - | Normalize serbest AA (min) | A.37 | A.38 |
| `AA_ox_valv` | Record<AminoAcidId, number> | - | AA oksidasyon valfi | A.38 | A.39 |
| `AA_ox_weights` | Record<AminoAcidId, number> | - | AA oksidasyon ağırlıkları | A.39 | A.40 |
| `AA_ox_rate` | Record<AminoAcidId, number> | g/day | AA oksidasyon hızları | A.40 | State update |

### 4.8 Gluconeogenesis

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `AA_gluco_weights` | Record<AminoAcidId, number> | - | Glukoneojenik AA ağırlıkları | Weight calc | A.41, A.42 |
| `V_max_gluconeo` | number | mol/day | Maksimum glukoneogenez hızı | A.41 | A.42 |
| `V_gluconeo` | number | mol/day | Gerçek glukoneogenez hızı | A.42 | State update |

### 4.9 Carbon Metabolism

| Variable | Type | Unit | Description (TR) | Calculated In | Used In |
|----------|------|------|------------------|---------------|---------|
| `V_max_glucox` | number | mol/day | Maksimum glukoz oksidasyonu | A.43 | Energy calc |
| `V_max_glycogen` | number | mol/day | Maksimum glikojen dönüşümü | A.44 | Glycogen calc |
| `V_max_lipogen` | number | mol/day | Maksimum lipogenez | A.45 | Lipogenesis calc |
| `TAG_betox` | Record<FattyAcidId, number> | g/day | FA beta-oksidasyon hızları | A.46 | State update |
| `TAG_ox_weights` | Record<FattyAcidId, number> | - | FA oksidasyon ağırlıkları | Weight calc | A.46 |

---

## 5. Output Variables

### 5.1 Calibration Metrics

| Variable | Type | Unit | Description (TR) | Calculated In |
|----------|------|------|------------------|---------------|
| `MAPE` | number | % | Ortalama mutlak yüzde hata | Eq. 1, 4 |
| `CAE` | number | g | Kümülatif mutlak hata | Eq. 2 |
| `WE_CL` | number | - | Ham lipit ağırlıklı hata | Eq. 3 |

### 5.2 Performance Indicators

| Variable | Type | Unit | Description (TR) | Formula |
|----------|------|------|------------------|---------|
| `RGR` | number | %/day | Göreceli büyüme hızı | (e^((ln(W2)-ln(W1))/days) - 1) × 100 |
| `SGR` | number | %/day | Spesifik büyüme hızı | ((ln(W2)-ln(W1))/days) × 100 |
| `FCR` | number | g/g | Yem dönüşüm oranı | feed / weight_gain |
| `FE` | number | % | Yem etkinliği | (weight_gain / feed) × 100 |
| `PER` | number | g/g | Protein etkinlik oranı | weight_gain / protein_consumed |
| `NRE` | number | % | Azot tutma etkinliği | (N_retained / N_consumed) × 100 |
| `LRE` | number | % | Lipit tutma etkinliği | (lipid_retained / lipid_consumed) × 100 |
| `ERE` | number | % | Enerji tutma etkinliği | (energy_retained / DE_consumed) × 100 |
| `TGC` | number | - | Termal büyüme katsayısı | (W2^(1/3) - W1^(1/3)) / degree_days × 1000 |

### 5.3 Metabolic Fluxes

| Variable | Type | Unit | Description (TR) |
|----------|------|------|------------------|
| `proteinSynthesis` | number | g/day | Protein sentez hızı |
| `proteinDegradation` | number | g/day | Protein degradasyon hızı |
| `aaOxidation` | number | g/day | AA oksidasyon hızı |
| `faBetaOxidation` | number | g/day | FA beta-oksidasyon hızı |
| `gluconeogenesis` | number | mol/day | Glukoneogenez hızı |
| `glucoseOxidation` | number | mol/day | Glukoz oksidasyon hızı |
| `lipogenesis` | number | mol/day | Lipogenez hızı |
| `glycogenesis` | number | mol/day | Glikojenez hızı |
| `glycogenolysis` | number | mol/day | Glikojenoliz hızı |

---

## 6. Constants

### 6.1 Amino Acid Molecular Weights (g/mol)

| AA | Code | MW | Description |
|----|------|-----|-------------|
| Alanine | Ala | 89.09 | Alanin |
| Arginine | Arg | 174.20 | Arjinin |
| Asparagine | Asn | 132.12 | Asparagin |
| Aspartic acid | Asp | 133.10 | Aspartik asit |
| Cysteine | Cys | 121.16 | Sistein |
| Glutamine | Gln | 146.15 | Glutamin |
| Glutamic acid | Glu | 147.13 | Glutamik asit |
| Glycine | Gly | 75.07 | Glisin |
| Histidine | His | 155.16 | Histidin |
| Isoleucine | Ile | 131.18 | İzolösin |
| Leucine | Leu | 131.18 | Lösin |
| Lysine | Lys | 146.19 | Lizin |
| Methionine | Met | 149.21 | Metiyonin |
| Phenylalanine | Phe | 165.19 | Fenilalanin |
| Proline | Pro | 115.13 | Prolin |
| Serine | Ser | 105.09 | Serin |
| Threonine | Thr | 119.12 | Treonin |
| Tryptophan | Trp | 204.23 | Triptofan |
| Tyrosine | Tyr | 181.19 | Tirozin |
| Valine | Val | 117.15 | Valin |

### 6.2 Fatty Acid Molecular Weights (g/mol)

| FA | Name | MW | Description |
|----|------|-----|-------------|
| C14:0 | Myristic | 228.37 | Miristik asit |
| C16:0 | Palmitic | 256.42 | Palmitik asit |
| C16:1 | Palmitoleic | 254.41 | Palmitoleik asit |
| C18:0 | Stearic | 284.48 | Stearik asit |
| C18:1 | Oleic | 282.46 | Oleik asit |
| C18:2 | Linoleic | 280.45 | Linoleik asit |
| C18:3 | Linolenic | 278.43 | Linolenik asit |
| C20:4 | Arachidonic | 304.47 | Araşidonik asit |
| C20:5 | EPA | 302.45 | Eikosapentaenoik asit |
| C22:6 | DHA | 328.49 | Dokosaheksaenoik asit |

### 6.3 ATP Stoichiometry

#### ATP from Amino Acid Oxidation (mol ATP / mol AA)

| AA | ATP | AA | ATP |
|----|-----|-----|-----|
| Ala | 13 | Leu | 32 |
| Arg | 25 | Lys | 28 |
| Asn | 16 | Met | 20 |
| Asp | 15 | Phe | 34 |
| Cys | 12 | Pro | 22 |
| Gln | 18 | Ser | 12 |
| Glu | 18 | Thr | 16 |
| Gly | 6 | Trp | 36 |
| His | 17 | Tyr | 34 |
| Ile | 30 | Val | 26 |

#### ATP from Fatty Acid Beta-Oxidation (mol ATP / mol FA)

| FA | ATP |
|----|-----|
| C14:0 | 92 |
| C16:0 | 106 |
| C16:1 | 104 |
| C18:0 | 120 |
| C18:1 | 118 |
| C18:2 | 116 |
| C18:3 | 114 |
| C20:4 | 126 |
| C20:5 | 124 |
| C22:6 | 134 |

### 6.4 Other Constants

| Constant | Value | Unit | Description |
|----------|-------|------|-------------|
| `ATP_PER_GLUCOSE` | 32 | mol ATP/mol | Glukoz oksidasyonundan ATP |
| `GLUCOSE_PER_PALMITATE` | 4 | mol/mol | Lipogenezde glukoz/palmitat |
| `MAX_ATP_EXPENDITURE` | 600×10⁻⁶ | mol/g/h | Maksimum ATP harcama limiti |
| `MODEL_TIMESTEP` | 0.01 | day | Model zaman adımı (~14.4 dk) |

---

## 7. Variable-Formula Matrix

### Input → Formula Mapping

```
temperature ─────┬─► A.1, A.2 (Feed intake)
                 ├─► A.12 (ATP expenditure)
                 ├─► A.20 (Protein synthesis temp effect)
                 ├─► A.31 (Degradation temp effect)
                 ├─► A.35 (Min AA loss)
                 ├─► A.41 (Gluconeogenesis)
                 ├─► A.43 (Glucose oxidation)
                 └─► A.45 (Lipogenesis)

bodyWeight ──────┬─► A.1, A.2 (Feed intake)
                 ├─► A.12 (ATP expenditure)
                 ├─► A.35 (Min AA loss)
                 ├─► A.41 (Gluconeogenesis)
                 ├─► A.43 (Glucose oxidation)
                 └─► A.45 (Lipogenesis)

feedGiven ───────► A.3 (Actual feed intake)

CL_q ────────────┬─► A.14 (AA/FA oxidation ratio)
                 ├─► A.16, A.17 (AA oxidation mass)
                 ├─► A.27 (Protein synthesis regulator)
                 └─► A.45 (Lipogenesis control)
```

### Formula Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MODEL FLOW                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUTS                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                               │
│  │Temperature│  │Feed Given│  │Feed Props│                               │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                               │
│       │             │             │                                      │
│       ▼             ▼             ▼                                      │
│  ┌─────────────────────────────────────┐                                │
│  │     FEED INTAKE (A.1-A.3)           │                                │
│  │     FI = min(FI_max, feed_given)    │                                │
│  └──────────────┬──────────────────────┘                                │
│                 │                                                        │
│                 ▼                                                        │
│  ┌─────────────────────────────────────┐                                │
│  │     GUT COMPARTMENT (A.4-A.8)       │                                │
│  │     Digestion → Absorption          │                                │
│  └──────────────┬──────────────────────┘                                │
│                 │                                                        │
│                 ▼                                                        │
│  ┌─────────────────────────────────────┐      ┌────────────────────┐    │
│  │   BODY COMPOSITION (A.9-A.11)       │◄────►│  ENERGY (A.12-A.18)│    │
│  │   protein_total, lipid_total, CL_q  │      │  ATP balance       │    │
│  └──────────────┬──────────────────────┘      └─────────┬──────────┘    │
│                 │                                       │               │
│       ┌─────────┴─────────┐                            │               │
│       ▼                   ▼                            ▼               │
│  ┌────────────┐     ┌────────────┐              ┌────────────┐         │
│  │  NITROGEN  │     │  CARBON    │              │ m_ox_AA    │         │
│  │ (A.19-A.42)│◄───►│ (A.43-A.46)│◄─────────────│ m_ox_FA    │         │
│  └────────────┘     └────────────┘              └────────────┘         │
│       │                   │                                             │
│       └─────────┬─────────┘                                             │
│                 ▼                                                        │
│  ┌─────────────────────────────────────┐                                │
│  │      STATE UPDATE                    │                                │
│  │   (Forward Euler, dt=0.01 day)      │                                │
│  └──────────────┬──────────────────────┘                                │
│                 │                                                        │
│                 ▼                                                        │
│  ┌─────────────────────────────────────┐                                │
│  │    PERFORMANCE INDICATORS           │                                │
│  │    RGR, SGR, FCR, PER, etc.        │                                │
│  └─────────────────────────────────────┘                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. TypeScript Type Reference

### Import Statement
```typescript
import {
  // Types
  AminoAcidId,
  FattyAcidId,
  FishSpecies,
  FeedProperties,
  FeedIntakeParams,
  EnergyMetabolismParams,
  ProteinMetabolismParams,
  AAMaintenanceParams,
  GluconeogenesisParams,
  GlucoseOxidationParams,
  LipogenesisParams,
  GutState,
  BodyComposition,
  RibosomeState,
  FishState,

  // Constants
  AA_MOLECULAR_WEIGHTS,

  // Formulas
  calculateFeedIntake,
  calculateCL_q,
  calculateEnergyBalance,
  calculateActualProteinSynthesis,
  calculateRGR,
  // ... etc
} from 'feednetics';
```

---

## License

Based on: Soares et al. (2023). "Development and Application of a Mechanistic Nutrient-Based Model for Precision Fish Farming." J. Mar. Sci. Eng., 11, 472.
