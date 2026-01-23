# FEEDNETICS Ortak Değişkenler Referansı

Bu dokümantasyon, FEEDNETICS modelinde birden fazla denklemde kullanılan ortak değişkenleri tanımlar.

---

## 1. Durum Değişkenleri (State Variables)

### 1.1 Vücut Kompozisyonu

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `bodyWeight` | BW | g | A.1, A.2, A.12, A.35, A.43, A.45 | Toplam vücut ağırlığı |
| `proteinTotal` | protein_total | g | A.9, A.19, A.30, A.44 | Toplam vücut proteini |
| `lipidTotal` | lipid_total | g | A.10, A.11 | Toplam vücut yağı |
| `glycogen` | glycogen | mol | A.44 | Glikojen deposu |
| `glucose` | glucose | mol | A.42, A.43, A.45 | Kan glikozu |

### 1.2 Amino Asit Havuzları

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `freeAA` | AA_free | mol | A.28, A.33, A.36, A.37 | Serbest amino asit havuzu |
| `proteinAA` | protein_AA | mol | A.9 | Proteine bağlı AA |

### 1.3 Yağ Asidi Havuzları

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `TAG_body` | TAG_body | mol | A.10, A.46 | Vücut TAG deposu |
| `TAG_blood` | TAG_blood | mol | A.10 | Kan TAG seviyesi |

---

## 2. Kontrol Değişkenleri (Control Variables)

### 2.1 Ana Kontrol Değişkenleri

| Değişken | Sembol | Aralık | Kullanıldığı Denklemler | Açıklama |
|----------|--------|--------|------------------------|----------|
| `CL_q` | CL_q | [0, 1] | A.11, A.14, A.16, A.27 | Lipid durumu kontrol değişkeni |
| `temperature` | T | °C | A.2, A.12, A.20, A.31, A.35, A.41, A.43, A.45 | Su sıcaklığı |
| `fedScaling` | fed | [0, 1] | A.12, A.27 | Beslenme durumu (tok/aç) |
| `starving` | starving | [0, 1] | A.27 | Açlık durumu |

### 2.2 CL_q Detayları

```
CL_q Değeri    Anlam                      Etki
───────────────────────────────────────────────────────────────
0.0 - 0.3      Lipid yetersiz             AA oksidasyonu yüksek
0.3 - 0.5      Hafif lipid eksikliği      Dengeli oksidasyon
0.5 - 0.7      Normal lipid durumu        FA oksidasyonu tercih
0.7 - 1.0      Lipid fazlası              FA oksidasyonu maksimum
```

**Formül (A.11):**
```
CL_q = 1 / (1 + (lipid_ref / lipid_total)^β)
```

**Kullanım Yerleri:**
- **A.14**: AA/FA oksidasyon oranı → `m_ox_AA = [(1-CL_q)/CL_q] × m_ox_FA`
- **A.16**: AA oksidasyon miktarı → payda'da `CL_q/(1-CL_q)`
- **A.27**: Protein sentez regülatörü → `0.05 + 0.95 × min(1, max(0, CL_q + fed - starving))`

---

## 3. Referans Değerleri (Reference Values)

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `lipidRef` | lipid_ref | g | A.11 | Referans lipid seviyesi |
| `ref_AA_free` | ref_AA_free | mol | A.28, A.33 | Referans serbest AA |
| `max_ref_AA_free` | max_ref_AA_free | mol | A.36 | Maksimum referans AA |
| `min_ref_AA_free` | min_ref_AA_free | mol | A.37 | Minimum referans AA |
| `ref_glucose` | ref_glucose | mol | A.42 | Referans glukoz seviyesi |
| `glycogenRef` | glycogen_ref | mol | Glycogenesis | Referans glikojen |

---

## 4. Ribozom Değişkenleri

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `ribo_occupied` | ribo_occ | - | A.21, A.23, A.25 | Meşgul ribozomlar |
| `ribo_unoccupied` | ribo_unocc | - | A.22, A.24, A.25 | Boş ribozomlar |
| `ribo_act` | ribo_act | [0, 1] | A.25, A.26 | Ribozom aktivitesi |

**İlişki Grafiği:**
```
ribo_unoccupied ◄─── activation ───► ribo_occupied
       │                                   │
       └────────► ribo_act = ──────────────┘
                  unocc / (occ + unocc)
                         │
                         ▼
                      k_RNA (A.26)
                         │
                         ▼
                  max_prot_synth (A.19)
```

---

## 5. ATP Değişkenleri

### 5.1 ATP Akış Değişkenleri

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `ATP_exp` | ATP_exp | mol/gün | A.12, A.13 | Toplam ATP harcaması |
| `ATP_req` | ATP_req | mol/gün | A.13, A.15, A.16, A.18 | Oksidasyondan gereken ATP |
| `ATP_cost_anab` | ATP_anab | mol/gün | A.12 | Anabolik ATP maliyeti |
| `ATP_cost_basal` | ATP_basal | mol/gün | A.12 | Bazal metabolizma ATP |
| `ATP_prod_catab` | ATP_catab | mol/gün | A.13 | Katabolik ATP üretimi |
| `ATP_prod_glucox` | ATP_glucox | mol/gün | A.13 | Glukoz oksidasyonundan ATP |

### 5.2 ATP Denge Diyagramı

```
┌─────────────────────────────────────────────────────────────────┐
│                        ATP DENGESİ                               │
└─────────────────────────────────────────────────────────────────┘

              HARCAMA (A.12)                    ÜRETİM
         ┌──────────────────┐           ┌──────────────────┐
         │ ATP_cost_anab    │           │ ATP_prod_catab   │
         │ (protein sentez, │           │ (protein yıkımı) │
         │  lipogenez, vb.) │           │                  │
         └────────┬─────────┘           └────────┬─────────┘
                  │                              │
                  │                              │
         ┌────────┴─────────┐           ┌────────┴─────────┐
         │ ATP_cost_basal   │           │ ATP_prod_glucox  │
         │ × (1 + fed×SDA)  │           │ (glukoz oxid.)   │
         └────────┬─────────┘           └────────┬─────────┘
                  │                              │
                  ▼                              ▼
         ┌─────────────────────────────────────────────────┐
         │  ATP_req = ATP_exp - ATP_catab - ATP_glucox     │
         │                     (A.13)                      │
         └──────────────────────┬──────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐        ┌──────────────┐
            │  AA Oxid.    │        │  FA Oxid.    │
            │  (A.16-A.17) │        │  (A.18)      │
            │  m_ox_AA     │        │  m_ox_FA     │
            └──────────────┘        └──────────────┘
```

---

## 6. Hız Değişkenleri (Rate Variables)

### 6.1 Protein Metabolizması

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `k_RNA` | k_RNA | 1/gün | A.19, A.26 | Translasyon hızı |
| `vs_T` | vs_T | - | A.19, A.20 | Sıcaklık etkisi (sentez) |
| `max_prot_synth` | max_synth | g/gün | A.19, A.29 | Maks protein sentezi |
| `prot_synth` | prot_synth | g/gün | A.29 | Gerçek protein sentezi |
| `max_prot_deg` | max_deg | g/gün | A.30, A.34 | Maks protein yıkımı |
| `min_prot_deg` | min_deg | g/gün | A.32, A.34 | Min protein yıkımı |
| `prot_deg` | prot_deg | g/gün | A.34 | Gerçek protein yıkımı |

### 6.2 Oksidasyon Hızları

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `m_ox_AA` | m_ox_AA | g/gün | A.14, A.16, A.17, A.40 | AA oksidasyon miktarı |
| `m_ox_FA` | m_ox_FA | g/gün | A.14, A.18, A.46 | FA oksidasyon miktarı |
| `min_AA_loss` | min_AA_loss | g/gün | A.17, A.32, A.35 | Minimum AA kaybı |

### 6.3 Karbon Metabolizması

| Değişken | Sembol | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|--------|-------|------------------------|----------|
| `V_glucox` | V_glucox | mol/gün | A.43 | Glukoz oksidasyon hızı |
| `V_gluconeo` | V_gluconeo | mol/gün | A.41, A.42 | Glukoneogenez hızı |
| `V_lipogen` | V_lipogen | mol/gün | A.45 | Lipogenez hızı |
| `V_glycogen` | V_glycogen | mol/gün | A.44 | Glikojen turnover hızı |

---

## 7. Stokiyometri Sabitleri

### 7.1 ATP Stokiyometrisi

| Değişken | Birim | Kullanıldığı Denklemler | Açıklama |
|----------|-------|------------------------|----------|
| `ATP_stoich_AA` | mol ATP/g AA | A.15, A.16 | AA oksidasyonundan ATP |
| `ATP_stoich_FA` | mol ATP/g FA | A.15, A.16, A.18 | FA oksidasyonundan ATP |
| `ATP_PER_GLUCOSE` | mol ATP/mol | A.13 | Glukoz oksidasyonundan ATP (~32) |

### 7.2 Amino Asit Bazlı ATP Değerleri

```typescript
ATP_STOICH_AA = {
  Ala: 13, Arg: 25, Asn: 16, Asp: 15, Cys: 12,
  Gln: 18, Glu: 18, Gly: 6,  His: 17, Ile: 30,
  Leu: 32, Lys: 28, Met: 20, Phe: 34, Pro: 22,
  Ser: 12, Thr: 16, Trp: 36, Tyr: 34, Val: 26
}
```

### 7.3 Yağ Asidi Bazlı ATP Değerleri

```typescript
ATP_STOICH_FA = {
  'C14:0': 92,   // Miristik asit
  'C16:0': 106,  // Palmitik asit
  'C18:0': 120,  // Stearik asit
  'C18:1': 118,  // Oleik asit
  'C20:5': 124,  // EPA
  'C22:6': 134   // DHA
}
```

---

## 8. Valf Değişkenleri (Valve Variables)

Valf değişkenleri sigmoid fonksiyonlarla hesaplanır ve [0, 1] aralığındadır.

| Değişken | Formül | Kullanıldığı Denklemler | Açıklama |
|----------|--------|------------------------|----------|
| `AA_synt_valv` | `1/(1 + (ref/AA_free)^β)` | A.28, A.29 | AA sentez valfi |
| `AA_deg_valv` | `[1/(1 + (AA/ref)^β₂)]^β₁` | A.33, A.34 | AA yıkım valfi |
| `AA_ox_valv` | `min(max_norm, min_norm)` | A.38, A.39 | AA oksidasyon valfi |
| `prot_synt_regulator` | `0.05 + 0.95×...` | A.27, A.29 | Sentez regülatörü |

### Valf Davranışı Grafiği

```
Valf Değeri
    │
1.0 ┤                    ●●●●●●●●●●●●●●●●●●
    │                 ●●●
0.8 ┤              ●●●
    │            ●●
0.6 ┤          ●●
    │        ●●
0.4 ┤      ●●
    │    ●●
0.2 ┤  ●●
    │●●
0.0 ┼●
    └────┬────┬────┬────┬────┬────┬────┬────▶
        0.5  1.0  1.5  2.0  2.5  3.0  3.5  Substrat/Referans
```

---

## 9. Parametre Grupları

### 9.1 Tür-Bağımsız Sabitler

| Parametre | Değer | Birim | Açıklama |
|-----------|-------|-------|----------|
| `MODEL_TIMESTEP` | 0.01 | gün | Model adım süresi (~14.4 dk) |
| `MAX_ATP_EXPENDITURE` | 600 | µmol/g/saat | Üst ATP limiti |
| `WATER_FRACTION` | 0.70 | - | Yağsız kütledeki su oranı |
| `ASH_FRACTION` | 0.03 | - | Vücut ağırlığındaki kül oranı |

### 9.2 Tür-Spesifik Parametreler

Her tür için ayrı değerler:

```typescript
interface SpeciesParams {
  // Yem alımı (A.1-A.3)
  feedIntake: { a, b, c, T_low, T_high, beta }

  // Protein metabolizması (A.19-A.34)
  proteinMetabolism: {
    k_RNA_min, k_RNA_max, C_s, temperatureEffect,
    k_ribo, k_deg, V_db, V_dm, T_optimal,
    protDegMinFactor, AA_synt_beta, AA_deg_beta_1, AA_deg_beta_2
  }

  // Enerji metabolizması (A.12-A.18)
  energyMetabolism: { feedCostScale, basalATP_a, basalATP_b, basalATP_c }

  // AA bakım (A.35)
  aaMaintenance: { req_prot_a, req_prot_b, req_prot_c }

  // Glukoneogenez (A.41-A.42)
  gluconeogenesis: { a_gluconeo, b }

  // Glukoz oksidasyonu (A.43)
  glucoseOxidation: { a_glucox, b }

  // Lipogenez (A.45)
  lipogenesis: { a_lipogen, b }
}
```

---

## 10. Değişken Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FEEDNETICS DEĞİŞKEN AKIŞI                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              temperature (T)
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
    ┌───────────┐            ┌───────────┐            ┌───────────┐
    │ FeedIntake│            │   vs_T    │            │ deg_temp  │
    │  (A.2)    │            │  (A.20)   │            │  (A.31)   │
    └─────┬─────┘            └─────┬─────┘            └─────┬─────┘
          │                        │                        │
          ▼                        ▼                        ▼
    ┌───────────┐            ┌───────────┐            ┌───────────┐
    │ freeAA ↑  │───────────▶│max_synth  │            │ max_deg   │
    └─────┬─────┘            │  (A.19)   │            │  (A.30)   │
          │                  └─────┬─────┘            └─────┬─────┘
          │                        │                        │
          ▼                        ▼                        ▼
    ┌───────────┐            ┌───────────┐            ┌───────────┐
    │AA_synt_valv│──────────▶│prot_synth │            │ prot_deg  │
    │  (A.28)   │            │  (A.29)   │            │  (A.34)   │
    └───────────┘            └─────┬─────┘            └─────┬─────┘
                                   │                        │
                                   └──────────┬─────────────┘
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │  NET BÜYÜME         │
                                   │  = synth - deg      │
                                   └──────────┬──────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
             ┌───────────┐            ┌───────────┐            ┌───────────┐
             │proteinTotal│            │lipidTotal │            │ bodyWeight│
             │  (A.9)    │            │  (A.10)   │            │           │
             └─────┬─────┘            └─────┬─────┘            └───────────┘
                   │                        │
                   │                        ▼
                   │                  ┌───────────┐
                   │                  │   CL_q    │◄─── lipidRef
                   │                  │  (A.11)   │
                   │                  └─────┬─────┘
                   │                        │
                   └────────────────────────┼─────────────────────┐
                                            │                     │
                                            ▼                     ▼
                                     ┌───────────┐         ┌───────────┐
                                     │  m_ox_AA  │         │  m_ox_FA  │
                                     │  (A.16)   │         │  (A.18)   │
                                     └───────────┘         └───────────┘
```

---

## 11. Hızlı Referans Tablosu

### Tüm Ortak Değişkenler (Alfabetik)

| # | Değişken | Tip | Denklemler |
|---|----------|-----|------------|
| 1 | `AA_deg_valv` | Valf | A.33, A.34 |
| 2 | `AA_free` | Durum | A.28, A.33, A.36, A.37 |
| 3 | `AA_ox_valv` | Valf | A.38, A.39, A.40 |
| 4 | `AA_synt_valv` | Valf | A.28, A.29 |
| 5 | `ATP_cost_anab` | ATP | A.12 |
| 6 | `ATP_cost_basal` | ATP | A.12 |
| 7 | `ATP_exp` | ATP | A.12, A.13 |
| 8 | `ATP_prod_catab` | ATP | A.13 |
| 9 | `ATP_prod_glucox` | ATP | A.13 |
| 10 | `ATP_req` | ATP | A.13, A.15, A.16, A.18 |
| 11 | `ATP_stoich_AA` | Sabit | A.15, A.16 |
| 12 | `ATP_stoich_FA` | Sabit | A.15, A.16, A.18 |
| 13 | `bodyWeight` | Durum | A.1, A.2, A.12, A.35, A.43, A.45 |
| 14 | `CL_q` | Kontrol | A.11, A.14, A.16, A.27 |
| 15 | `fedScaling` | Kontrol | A.12, A.27 |
| 16 | `glucose` | Durum | A.42, A.43, A.45 |
| 17 | `glycogen` | Durum | A.44 |
| 18 | `k_RNA` | Hız | A.19, A.26 |
| 19 | `lipidRef` | Referans | A.11 |
| 20 | `lipidTotal` | Durum | A.10, A.11 |
| 21 | `m_ox_AA` | Hız | A.14, A.16, A.17, A.40 |
| 22 | `m_ox_FA` | Hız | A.14, A.18, A.46 |
| 23 | `max_prot_deg` | Hız | A.30, A.34 |
| 24 | `max_prot_synth` | Hız | A.19, A.29 |
| 25 | `min_AA_loss` | Hız | A.17, A.32, A.35 |
| 26 | `min_prot_deg` | Hız | A.32, A.34 |
| 27 | `proteinTotal` | Durum | A.9, A.19, A.30, A.44 |
| 28 | `prot_deg` | Hız | A.34 |
| 29 | `prot_synth` | Hız | A.29 |
| 30 | `prot_synt_regulator` | Valf | A.27, A.29 |
| 31 | `ref_AA_free` | Referans | A.28, A.33 |
| 32 | `ribo_act` | Ribozom | A.25, A.26 |
| 33 | `ribo_occupied` | Ribozom | A.21, A.23, A.25 |
| 34 | `ribo_unoccupied` | Ribozom | A.22, A.24, A.25 |
| 35 | `starving` | Kontrol | A.27 |
| 36 | `TAG_blood` | Durum | A.10 |
| 37 | `TAG_body` | Durum | A.10, A.46 |
| 38 | `temperature` | Kontrol | A.2, A.12, A.20, A.31, A.35, A.41, A.43, A.45 |
| 39 | `V_gluconeo` | Hız | A.41, A.42 |
| 40 | `V_glucox` | Hız | A.43 |
| 41 | `V_glycogen` | Hız | A.44 |
| 42 | `V_lipogen` | Hız | A.45 |
| 43 | `vs_T` | Hız | A.19, A.20 |

---

*Kaynak: Soares et al. (2023). J. Mar. Sci. Eng., 11, 472.*
