# FEEDNETICS Model - Matematiksel Formülasyon

> **Kaynak:** Soares et al. (2023). J. Mar. Sci. Eng., 11, 472.
> https://doi.org/10.3390/jmse11030472

---

## 1. Model Kalibrasyon ve Validasyon Metrikleri

### Denklem (1) - MAPE Kalibrasyon
```
                    100   n  | P_bw_i - O_bw_i |
MAPE_cal_bw (%) = ───── × Σ  |─────────────────|
                     n   i=1 |     O_bw_i      |
```

### Denklem (2) - Kümülatif Mutlak Hata
```
                  n
CAE_bw (g) =  Σ  |P_bw_i - O_bw_i|
             i=1
```

### Denklem (3) - Ham Lipit Ağırlıklı Hata
```
              1    m
WE_CL = ───── × Σ  (CL_ref - CL_predicted)² × 0.1
              m   j=1
```

### Denklem (4) - MAPE Validasyon
```
                    100   n  | P_bw_i - O_bw_i |
MAPE_val_bw (%) = ───── × Σ  |─────────────────|
                     n   i=1 |     O_bw_i      |
```

**Değişkenler:**
- P_bw_i = Tahmin edilen vücut ağırlığı (g)
- O_bw_i = Gözlemlenen vücut ağırlığı (g)
- n = Gözlem sayısı
- CL_predicted = Tahmin edilen ham lipit içeriği (%)
- CL_ref = Referans ham lipit değeri (%)

---

## 2. Yem Alımı Kontrolü

### Denklem (A.1) - Maksimum Yem Alımı (Orijinal Lupatsch)
```
FI_max = a × BW^b × e^(cT) × I(T > T_low) × I(T < T_high)
```

### Denklem (A.2) - Maksimum Yem Alımı (Düzgün Yaklaşım)
```
                                          1                        1
FI_max = a × BW^b × e^(cT) × ─────────────────────── × ───────────────────────
                              1 + (T_low/T)^β          1 + (T/T_high)^β
```

### Denklem (A.3) - Gerçek Yem Alımı
```
FI = min(FI_max, feed_given)
```

**Değişkenler:**
- FI_max = Maksimum yem alımı (g/gün)
- a, b, c = Türe özgü parametreler
- BW = Balık vücut ağırlığı (g)
- T = Su sıcaklığı (°C)
- T_low, T_high = Sıcaklık sınırları (°C)
- β = Şekil parametresi
- I() = İndikatör fonksiyonu (doğruysa 1, değilse 0)

---

## 3. Bağırsak - Sindirim ve Absorpsiyon

### Denklem (A.4) - Sindirilebilir Besin Alımı
```
                FI × ADC_nutrient × feed_nutrient
DI_nutrient = ─────────────────────────────────────
                        Mw_nutrient
```

### Denklem (A.5) - Sindirim Hızı (İkinci Derece Kinetik)
```
digestion_nutrient = k_digestion × enzyme × digestible_nutrient
```

### Denklem (A.6) - Absorpsiyon Hızı
```
absorption_nutrient = k_absorption × receptor × digested_nutrient
```

### Denklem (A.7) - Enzim Dinamiği
```
d(enzyme)
───────── = (k_enz_prod × Σ digestible_nutrient) - k_enz_deg × enzyme
   dt
```

### Denklem (A.8) - Reseptör Dinamiği
```
d(receptor)
─────────── = (k_rec_prod × Σ digested_nutrient) - k_rec_deg × receptor
    dt
```

**Değişkenler:**
- DI_nutrient = Sindirilebilir besin alımı (mol/gün)
- ADC_nutrient = Görünür sindirilebilirlik katsayısı
- feed_nutrient = Yemdeki besin yüzdesi
- Mw_nutrient = Moleküler ağırlık (g/mol)
- k_enz_prod, k_enz_deg = Enzim üretim/yıkım sabitleri
- k_rec_prod, k_rec_deg = Reseptör üretim/yıkım sabitleri

---

## 4. Vücut Ağırlığı ve Kompozisyon

### Denklem (A.9) - Toplam Protein
```
                  20
protein_total = Σ  protein_AA_i × AA_Mw_i
                i=1
```

### Denklem (A.10) - Toplam Lipit
```
                 20
lipid_total = Σ  (TAG_body_FA_i + TAG_blood_FA_i) × FA_Mw_i
               i=1
```

### Denklem (A.11) - Ham Lipit Kontrol Değişkeni
```
                      1
CL_q = ─────────────────────────────────
        1 + (lipid_ref / lipid_total)^β
```

**Değişkenler:**
- protein_AA_i = i. amino asidin vücut proteinindeki kütlesi (mol)
- AA_Mw_i = i. amino asidin moleküler ağırlığı (g/mol)
- TAG_body_FA_i = i. yağ asidinin vücut lipitlerindeki kütlesi (mol)
- TAG_blood_FA_i = i. yağ asidinin kan lipitlerindeki kütlesi (mol)
- lipid_ref = Referans lipit seviyesi
- β = Şekil parametresi

---

## 5. Enerjetik Model

### Denklem (A.12) - ATP Harcaması
```
ATP_exp = ATP_cost_anab + (1 + fed_scaling × feed_cost_scale) × ATP_cost_basal(BW, T)
```

### Denklem (A.13) - Gerekli ATP (Oksidasyondan)
```
ATP_req = ATP_exp - ATP_prod_catab - ATP_prod_glucox
```

### Denklem (A.14) - AA vs FA Oksidasyon Dengesi
```
           1 - CL_q
m_ox_AA = ───────── × m_ox_FA
            CL_q
```

### Denklem (A.15) - Toplam ATP (Oksidasyondan)
```
ATP_req = m_ox_AA × ATP_stoich_AA + m_ox_FA × ATP_stoich_FA
```

### Denklem (A.16) - Oksitlenmiş Amino Asit Kütlesi
```
                        ATP_req
m_ox_AA = ─────────────────────────────────────────────
           (CL_q / (1-CL_q)) × ATP_stoich_FA + ATP_stoich_AA
```

### Denklem (A.17) - Düzeltilmiş AA Oksidasyonu
```
                    ⎛            ATP_req                           ⎞
m_ox_AA = max ⎜ ─────────────────────────────────────────────, min_AA_loss ⎟
                    ⎝ (CL_q/(1-CL_q)) × ATP_stoich_FA + ATP_stoich_AA      ⎠
```

### Denklem (A.18) - Yağ Asidi Beta-Oksidasyon Hızı
```
           ATP_req - ATP_AA_ox
m_ox_FA = ─────────────────────
            ATP_stoich_FA
```

**Değişkenler:**
- ATP_exp = ATP harcaması (mol/gün)
- ATP_cost_anab = Anabolik reaksiyonların ATP maliyeti
- ATP_cost_basal = Bazal ATP maliyeti
- fed_scaling = Beslenme durumu [0,1]
- ATP_stoich_AA = AA oksidasyonundan ATP verimi (mol ATP/g)
- ATP_stoich_FA = FA oksidasyonundan ATP verimi (mol ATP/g)
- m_ox_AA = Oksitlenmiş amino asit kütlesi (g)
- m_ox_FA = Oksitlenmiş yağ asidi kütlesi (g)

---

## 6. Azot Metabolizması - Protein Sentezi

### Denklem (A.19) - Maksimum Protein Sentez Hızı
```
max_prot_synth = min(k_RNA × vs_T × C_s × protein_total, lim_prot_synth)
```

### Denklem (A.20) - Sıcaklık Etkisi (Protein Sentezi)
```
vs_T = temperature_effect × T
```

### Denklem (A.21) - Ribozom Aktivasyonu
```
ribo_activation = k_ribo × ribo_occupied × valve_activation
```

### Denklem (A.22) - Ribozom Deaktivasyonu
```
ribo_deactivation = k_ribo × ribo_unoccupied × valve_deactivation
```

### Denklem (A.23) ve (A.24) - Ribozom Dinamiği
```
d(ribo_occupied)
──────────────── = ribo_deactivation - ribo_activation
      dt

d(ribo_unoccupied)
────────────────── = ribo_activation - ribo_deactivation
       dt
```

### Denklem (A.25) - Ribozom Aktivitesi
```
                    ribo_unoccupied
ribo_act = ─────────────────────────────────────
            ribo_occupied + ribo_unoccupied
```

### Denklem (A.26) - Translasyon Hızı
```
k_RNA = e^[(1-ribo_act) × ln(k_RNA_min) + ribo_act × ln(k_RNA_max)]
```

### Denklem (A.27) - Protein Sentez Regülatörü
```
prot_synt_regulator = 0.05 + 0.95 × min(1, max(0, CL_q + fed - starving))
```

### Denklem (A.28) - Amino Asit Sentez Valfi
```
                         ⎛              1                    ⎞
AA_synt_valv = min ⎜ ───────────────────────────────────── ⎟
                         ⎝ 1 + 1/(AA_free/ref_AA_free)^AA_synt_beta ⎠
```

### Denklem (A.29) - Gerçek Protein Sentez Hızı
```
A_prot_synth = max_prot_synth × prot_synt_regulator × AA_synt_valv
```

**Değişkenler:**
- k_RNA = Translasyon hızı
- vs_T = Sıcaklık etkisi
- C_s = Transkripsiyon hızı (RNA miktarı/g protein)
- lim_prot_synth = Substrat sınırlı maksimum hız
- ribo_act = Ribozom aktivitesi
- AA_free = Serbest amino asit miktarı

---

## 7. Azot Metabolizması - Protein Degradasyonu

### Denklem (A.30) - Maksimum Protein Degradasyonu
```
max_prot_deg = k_deg × deg_temp_factor × protein_total
```

### Denklem (A.31) - Sıcaklık Etkisi (Degradasyon)
```
deg_temp_factor = V_db + V_dm × (temperature - T_optimal)²
```

### Denklem (A.32) - Minimum Protein Degradasyonu
```
min_prot_deg = prot_deg_min_factor × min_AA_loss
```

### Denklem (A.33) - AA Degradasyon Valfi
```
                    ⎛              1                          ⎞^AA_deg_beta_1
AA_deg_valv = min ⎜ ────────────────────────────────────── ⎟
                    ⎝ 1 + (AA_free/ref_AA_free)^AA_deg_beta_2 ⎠
```

### Denklem (A.34) - Gerçek Protein Degradasyonu
```
prot_deg = min_prot_deg + (max_prot_deg - min_prot_deg) × AA_deg_valv
```

**Değişkenler:**
- k_deg = Degradasyon hız sabiti
- V_db, V_dm = Sıcaklık parametreleri
- T_optimal = Optimal sıcaklık (°C)

---

## 8. Amino Asit Oksidasyonu

### Denklem (A.35) - Minimum AA Kaybı (Açlık Bakımı)
```
min_AA_loss = req_prot_a × e^(req_prot_b × temperature) × (bw/1000)^req_prot_c
```

### Denklem (A.36) ve (A.37) - Normalize Serbest AA
```
                       AA_free
AA_free_max_norm = ─────────────────
                    max_ref_AA_free

                       AA_free
AA_free_min_norm = ─────────────────
                    min_ref_AA_free
```

### Denklem (A.38) - AA Oksidasyon Valfi
```
                    ⎛ AA_free_max_norm     AA_free_min_norm ⎞
AA_ox_valv = min ⎜ ─────────────────── , ─────────────────── ⎟
                    ⎝ Σ AA_free_max_norm   Σ AA_free_min_norm ⎠
```

### Denklem (A.39) - Oksidasyon Ağırlıkları
```
                  AA_ox_valv
AA_ox_weights = ─────────────
                 Σ AA_ox_valv
```

### Denklem (A.40) - AA Oksidasyon Hızı
```
AA_ox_rate = AA_ox_weights × m_ox_AA
```

---

## 9. Glukoneogenez

### Denklem (A.41) - Maksimum Glukoneogenez Hızı
```
V_max_gluconeo = min(AA_gluco_weights × stoich_glucose_AA→glc × a_gluconeo × bw × e^(b×temperature),
                     stoich_glucose_AA→glc × AA_free/timestep)
```

### Denklem (A.42) - Gerçek Glukoneogenez Hızı
```
                                      1
V_gluconeo = V_max_gluconeo × ─────────────────────── × AA_gluco_weights
                               1 + glucose/ref_glucose
```

---

## 10. Karbon Metabolizması

### Denklem (A.43) - Maksimum Glukoz Oksidasyonu
```
V_max_glucox = min(a_glucox × bw × e^(b×temperature), glucose/timestep)
```

### Denklem (A.44) - Maksimum Glikojen Döngüsü
```
V_max_glycogen = constant × protein_total
```

### Denklem (A.45) - Maksimum Lipogenez
```
V_max_lipogen = min(a_lipogen × bw × e^(b×temperature), glucose/timestep)
```

### Denklem (A.46) - Yağ Asidi Beta-Oksidasyonu
```
TAG_betox = TAG_ox_weights × m_ox_FA
```

---

## 11. Performans Göstergeleri

### Relatif Büyüme Hızı (RGR)
```
        ⎛   ln(ABW_i+n) - ln(ABW_i)  ⎞
RGR = ⎜ e^(─────────────────────────) - 1 ⎟ × 100
        ⎝      day_i+n - day_i        ⎠
```

**Değişkenler:**
- ABW = Ortalama vücut ağırlığı (g)
- RGR = Relatif büyüme hızı (%/gün)

---

## 12. Model Akış Şeması

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 GİRİŞLER                                    │
│                                                                             │
│   Sıcaklık (T)          Yem Miktarı (FI)         Yem Özellikleri           │
│        │                      │                        │                    │
│        └──────────────────────┼────────────────────────┘                    │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     YEM ALIMI KONTROLÜ                               │   │
│  │                                                                      │   │
│  │   FI_max = a × BW^b × e^(cT) × f(T_low, T_high)                     │   │
│  │   FI = min(FI_max, feed_given)                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SİNDİRİM & ABSORPSİYON                            │   │
│  │                                                                      │   │
│  │   DI = (FI × ADC × feed_nutrient) / Mw                              │   │
│  │   digestion = k_dig × enzyme × digestible                           │   │
│  │   absorption = k_abs × receptor × digested                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ENERJİ METABOLİZMASI                            │   │
│  │                                                                      │   │
│  │   ATP_exp = ATP_anab + (1 + fed × scale) × ATP_basal                │   │
│  │   ATP_req = ATP_exp - ATP_catab - ATP_glucox                        │   │
│  │                                                                      │   │
│  │   m_ox_AA = (1 - CL_q)/CL_q × m_ox_FA                               │   │
│  │   ATP_req = m_ox_AA × ATP_stoich_AA + m_ox_FA × ATP_stoich_FA       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│               ┌───────────────┴───────────────┐                             │
│               ▼                               ▼                             │
│  ┌────────────────────────┐     ┌────────────────────────┐                 │
│  │   AZOT METABOLİZMASI   │     │  KARBON METABOLİZMASI  │                 │
│  │                        │     │                        │                 │
│  │  • Protein Sentezi     │     │  • Glukoz Oksidasyonu  │                 │
│  │    A_prot_synth =      │     │    V_glucox = ...      │                 │
│  │    max × reg × valv    │     │                        │                 │
│  │                        │     │  • Glikojenez/liz      │                 │
│  │  • Protein Degradasyonu│     │    V_glycogen = ...    │                 │
│  │    prot_deg =          │     │                        │                 │
│  │    min + (max-min)×valv│     │  • Lipogenez           │                 │
│  │                        │     │    V_lipogen = ...     │                 │
│  │  • AA Oksidasyonu      │     │                        │                 │
│  │    AA_ox = weights×m_ox│     │  • Beta-Oksidasyon     │                 │
│  │                        │     │    TAG_betox = ...     │                 │
│  │  • Glukoneogenez       │     │                        │                 │
│  │    V_gluconeo = ...    │     │                        │                 │
│  └────────────────────────┘     └────────────────────────┘                 │
│               │                               │                             │
│               └───────────────┬───────────────┘                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         BÜYÜME ÇIKTISI                               │   │
│  │                                                                      │   │
│  │   protein_total = Σ protein_AA_i × AA_Mw_i                          │   │
│  │   lipid_total = Σ (TAG_body + TAG_blood) × FA_Mw                    │   │
│  │                                                                      │   │
│  │   BW = f(protein, lipid, glycogen, water, ash)                      │   │
│  │   RGR = (e^[(ln(BW2)-ln(BW1))/Δt] - 1) × 100                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Anahtar Sabitler ve Parametreler

| Parametre | Açıklama | Birim | Not |
|-----------|----------|-------|-----|
| BW | Vücut ağırlığı | g | Durum değişkeni |
| T | Su sıcaklığı | °C | Girdi |
| FI | Yem alımı | g/gün | Hesaplanan |
| ADC | Sindirilebilirlik katsayısı | % | Girdi |
| β | Şekil parametresi | - | Kalibre |
| ATP_stoich_AA | AA oksidasyon ATP verimi | mol ATP/g | Profile bağlı |
| ATP_stoich_FA | FA oksidasyon ATP verimi | mol ATP/g | Profile bağlı |
| Max ATP harcama | Fizyolojik üst sınır | 600 µmol·g⁻¹·h⁻¹ | Sabit |

### Zaman Çözünürlüğü
- Model zaman adımı: 0.01 gün (~14.4 dakika)
- Entegrasyon yöntemi: Forward Euler
- Yazılım: Powersim Studio 10 Expert

---

## 14. Kalibre Edilen Türler ve Performans

| Tür | Bilimsel Ad | MAPE (Validasyon) |
|-----|-------------|-------------------|
| Çipura | *Sparus aurata* | %12.6 |
| Levrek | *Dicentrarchus labrax* | %11.7 |
| Atlantik Somonu | *Salmo salar* | %11.7 |
| Gökkuşağı Alabalığı | *Oncorhynchus mykiss* | %13.8 |
| Nil Tilapyası | *Oreochromis niloticus* | %12.9 |

---

## 15. Referans

```
Soares, F.M.R.C., Nobre, A.M.D., Raposo, A.I.G., Mendes, R.C.P.,
Engrola, S.A.D., Rema, P.J.A.P., Conceição, L.E.C., Silva, T.S. (2023).
Development and Application of a Mechanistic Nutrient-Based Model
for Precision Fish Farming.
Journal of Marine Science and Engineering, 11(3), 472.
DOI: 10.3390/jmse11030472
```

**Lisans:** Open Access (CC BY 4.0)
