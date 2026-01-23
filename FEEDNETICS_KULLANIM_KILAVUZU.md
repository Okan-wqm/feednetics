# FEEDNETICS Model Kullanım Kılavuzu

## İçindekiler

1. [Model Genel Bakış](#1-model-genel-bakış)
2. [İş Akışları](#2-iş-akışları)
3. [Girdi Parametreleri](#3-girdi-parametreleri)
4. [Üretilen Sonuçlar](#4-üretilen-sonuçlar)
5. [Grafikler ve Görselleştirmeler](#5-grafikler-ve-görselleştirmeler)
6. [Örnek Senaryolar](#6-örnek-senaryolar)
7. [API Kullanımı](#7-api-kullanımı)

---

## 1. Model Genel Bakış

FEEDNETICS, balık yetiştiriciliği için geliştirilen mekanistik, besin-bazlı bir büyüme modelidir. Model şu türleri destekler:

| Tür | Bilimsel Ad | Doğrulama MAPE |
|-----|-------------|----------------|
| Çipura | *Sparus aurata* | %12.6 |
| Levrek | *Dicentrarchus labrax* | %11.7 |
| Atlantik Somon | *Salmo salar* | %11.7 |
| Gökkuşağı Alabalığı | *Oncorhynchus mykiss* | %13.8 |
| Nil Tilapyası | *Oreochromis niloticus* | %12.9 |

### Model Ne Yapar?

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│     GİRDİLER    │────▶│   FEEDNETICS     │────▶│      ÇIKTILAR       │
│                 │     │      MODEL       │     │                     │
│ • Balık ağırlığı│     │                  │     │ • Büyüme tahmini    │
│ • Su sıcaklığı  │     │ 46 Denklem       │     │ • Yem dönüşüm oranı │
│ • Yem bileşimi  │     │ 0.01 gün adım    │     │ • Vücut kompozisyonu│
│ • Yemleme oranı │     │ Forward Euler    │     │ • Enerji dengesi    │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

---

## 2. İş Akışları

### 2.1 Temel İş Akışı

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FEEDNETICS İŞ AKIŞI                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ADIM 1: VERİ GİRİŞİ                                                     │
│ ─────────────────────                                                   │
│ • Başlangıç balık ağırlığı (g)                                          │
│ • Su sıcaklığı profili (°C) - günlük veya saatlik                       │
│ • Yem özellikleri (protein, yağ, enerji, amino asit profili)            │
│ • Yemleme programı (günlük oran veya ad libitum)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ADIM 2: SİMÜLASYON ÇALIŞTIRMA                                           │
│ ─────────────────────────────                                           │
│ • Model 0.01 gün (~14.4 dakika) adımlarla ilerler                       │
│ • Her adımda 46 denklem çözülür                                         │
│ • Durum değişkenleri güncellenir (protein, yağ, glikojen, vb.)          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ADIM 3: SONUÇ ANALİZİ                                                   │
│ ─────────────────────                                                   │
│ • Büyüme eğrileri                                                       │
│ • Yem verimliliği metrikleri                                            │
│ • Vücut kompozisyonu değişimleri                                        │
│ • Ekonomik göstergeler                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ADIM 4: OPTİMİZASYON ÖNERİLERİ                                          │
│ ──────────────────────────────                                          │
│ • Optimal yemleme oranı                                                 │
│ • En uygun yem formülasyonu                                             │
│ • Sıcaklık yönetimi önerileri                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Kullanım Senaryoları

#### Senaryo A: Büyüme Tahmini
```
Amaç: 90 günlük yetiştirme döneminde balık ağırlığını tahmin etme

Girdiler:
├── Başlangıç ağırlığı: 50 g
├── Sıcaklık: 22°C (sabit)
├── Yem: %45 protein, %18 yağ
└── Yemleme: Vücut ağırlığının %2'si/gün

Çıktılar:
├── Günlük ağırlık değerleri
├── Toplam büyüme (g)
├── Spesifik büyüme oranı (SGR, %/gün)
└── Beklenen hasat ağırlığı
```

#### Senaryo B: Yem Optimizasyonu
```
Amaç: Farklı yem formülasyonlarını karşılaştırma

Girdiler:
├── Yem A: %45 protein, %15 yağ, 20 MJ/kg
├── Yem B: %42 protein, %20 yağ, 22 MJ/kg
└── Yem C: %48 protein, %12 yağ, 19 MJ/kg

Çıktılar:
├── Her yem için FCR (Yem Dönüşüm Oranı)
├── Protein tutma verimliliği
├── Enerji tutma verimliliği
└── Maliyet/kg canlı ağırlık
```

#### Senaryo C: Sıcaklık Etkisi Analizi
```
Amaç: Mevsimsel sıcaklık değişimlerinin etkisini modelleme

Girdiler:
├── Kış profili: 14-18°C
├── Yaz profili: 24-28°C
└── Geçiş dönemleri dahil

Çıktılar:
├── Mevsime göre büyüme hızları
├── Yem alımı değişimleri
├── Metabolik aktivite grafiği
└── Yıllık üretim tahmini
```

---

## 3. Girdi Parametreleri

### 3.1 Zorunlu Girdiler

| Parametre | Birim | Aralık | Açıklama |
|-----------|-------|--------|----------|
| `initialWeight` | g | 1-10000 | Başlangıç balık ağırlığı |
| `temperature` | °C | 4-30 | Su sıcaklığı |
| `feedProtein` | % | 23-58 | Yem ham protein oranı |
| `feedLipid` | % | 3-47 | Yem ham yağ oranı |
| `feedEnergy` | MJ/kg | 13-29 | Yem brüt enerji içeriği |

### 3.2 Opsiyonel Girdiler

| Parametre | Varsayılan | Açıklama |
|-----------|------------|----------|
| `feedingRate` | Ad libitum | Günlük yemleme oranı (% BW) |
| `simulationDays` | 90 | Simülasyon süresi |
| `timestep` | 0.01 | Model adım büyüklüğü (gün) |
| `aminoAcidProfile` | Tür bazlı | Detaylı amino asit profili |
| `fattyAcidProfile` | Tür bazlı | Detaylı yağ asidi profili |

### 3.3 Tür-Spesifik Parametreler

```typescript
// Örnek: Çipura için parametreler
const seabreamParams = {
  species: 'gilthead_seabream',
  T_low: 12,        // Alt sıcaklık limiti (°C)
  T_high: 28,       // Üst sıcaklık limiti (°C)
  T_optimal: 22,    // Optimal sıcaklık (°C)
  feedIntake: {
    a: 0.06,        // Yem alım katsayısı
    b: 0.6,         // Ağırlık üssü
    c: 0.08         // Sıcaklık katsayısı
  }
};
```

---

## 4. Üretilen Sonuçlar

### 4.1 Büyüme Metrikleri

| Metrik | Formül | Birim | Açıklama |
|--------|--------|-------|----------|
| **SGR** | `(ln(W₂) - ln(W₁)) / Δt × 100` | %/gün | Spesifik Büyüme Oranı |
| **RGR** | `(e^(SGR/100) - 1) × 100` | %/gün | Relatif Büyüme Oranı |
| **DWG** | `(W₂ - W₁) / Δt` | g/gün | Günlük Ağırlık Kazancı |
| **TGC** | `(W₂^⅓ - W₁^⅓) / (T × Δt) × 1000` | - | Termal Büyüme Katsayısı |

### 4.2 Yem Verimliliği Metrikleri

| Metrik | Formül | Birim | İdeal Değer |
|--------|--------|-------|-------------|
| **FCR** | `Yem Tüketimi / Ağırlık Kazancı` | - | 1.0-1.5 |
| **FE** | `Ağırlık Kazancı / Yem Tüketimi` | - | 0.7-1.0 |
| **PER** | `Ağırlık Kazancı / Protein Tüketimi` | - | 2.0-3.0 |
| **PRE** | `Protein Tutma / Protein Alımı × 100` | % | 35-50% |
| **ERE** | `Enerji Tutma / Enerji Alımı × 100` | % | 40-55% |

### 4.3 Vücut Kompozisyonu Çıktıları

```
Vücut Kompozisyonu Raporu
═══════════════════════════════════════════════════════

Komponent          Başlangıç    Son        Değişim
─────────────────────────────────────────────────────
Toplam Protein     8.2 g        24.6 g     +200%
Toplam Yağ         4.1 g        15.3 g     +273%
Glikojen           0.3 g        0.9 g      +200%
Kül                1.5 g        4.5 g      +200%
Su                 36.0 g       105.0 g    +192%
─────────────────────────────────────────────────────
TOPLAM AĞIRLIK     50.1 g       150.3 g    +200%

Yüzde Kompozisyon:
├── Protein: 16.4%
├── Yağ: 10.2%
├── Kül: 3.0%
└── Su: 69.8%
```

### 4.4 Metabolik Çıktılar

| Çıktı | Birim | Açıklama |
|-------|-------|----------|
| `ATP_production` | µmol/g/saat | Toplam ATP üretimi |
| `O2_consumption` | mg/g/saat | Oksijen tüketimi |
| `NH4_excretion` | mg/g/gün | Amonyak atılımı |
| `CO2_production` | mg/g/saat | Karbondioksit üretimi |
| `heat_loss` | kJ/g/gün | Isı kaybı (SDA dahil) |

### 4.5 Amino Asit Dengesi

```
Amino Asit Tutma Analizi
═══════════════════════════════════════════════════════

Amino Asit    Alım      Tutma     Oksidasyon  Verimlilik
              (mg/g)    (mg/g)    (mg/g)      (%)
─────────────────────────────────────────────────────────
Lizin         12.5      8.2       4.3         65.6%
Metiyonin     4.8       3.1       1.7         64.6%
Treonin       7.2       4.5       2.7         62.5%
Triptofan     2.1       1.4       0.7         66.7%
Arginin       10.3      6.8       3.5         66.0%
Histidin      4.5       2.9       1.6         64.4%
İzolösin      7.8       5.0       2.8         64.1%
Lösin         13.2      8.4       4.8         63.6%
Valin         8.5       5.4       3.1         63.5%
Fenilalanin   7.1       4.5       2.6         63.4%
─────────────────────────────────────────────────────────
TOPLAM        78.0      50.2      27.8        64.4%
```

---

## 5. Grafikler ve Görselleştirmeler

### 5.1 Büyüme Grafikleri

#### Grafik 1: Ağırlık-Zaman Eğrisi
```
Ağırlık (g)
    │
300 ┤                                          ●●●●
    │                                      ●●●●
250 ┤                                  ●●●●
    │                              ●●●●
200 ┤                          ●●●●
    │                      ●●●●
150 ┤                  ●●●●
    │              ●●●●
100 ┤          ●●●●
    │      ●●●●
 50 ┼──●●●●
    │
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         10   20   30   40   50   60   70   80   90   Gün

📊 Grafik Türü: Line Chart
📈 Veri: bodyWeight vs time
🎨 Renk: Mavi (#2196F3)
```

#### Grafik 2: Büyüme Hızı Değişimi
```
SGR (%/gün)
    │
3.5 ┤  ●●●
    │      ●●●
3.0 ┤          ●●●
    │              ●●●
2.5 ┤                  ●●●
    │                      ●●●
2.0 ┤                          ●●●
    │                              ●●●
1.5 ┤                                  ●●●
    │                                      ●●●
1.0 ┤                                          ●●●
    │
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         10   20   30   40   50   60   70   80   90   Gün

📊 Grafik Türü: Line Chart (decreasing trend)
📈 Veri: SGR vs time
🎨 Renk: Yeşil (#4CAF50)
```

### 5.2 Yem Verimliliği Grafikleri

#### Grafik 3: FCR Değişimi
```
FCR
    │
2.0 ┤                                          ●●●
    │                                      ●●●
1.8 ┤                                  ●●●
    │                              ●●●
1.6 ┤                          ●●●
    │                      ●●●
1.4 ┤                  ●●●
    │              ●●●
1.2 ┤          ●●●
    │      ●●●
1.0 ┼──●●●
    │
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         10   20   30   40   50   60   70   80   90   Gün

📊 Grafik Türü: Line Chart (increasing trend)
📈 Veri: FCR vs time
🎨 Renk: Turuncu (#FF9800)
⚠️ Not: FCR artışı normal - büyük balıklar daha az verimli
```

#### Grafik 4: Kümülatif Yem Tüketimi vs Ağırlık Kazancı
```
Ağırlık Kazancı (g)
    │
250 ┤                                      ●
    │                                  ●
200 ┤                              ●
    │                          ●
150 ┤                      ●
    │                  ●
100 ┤              ●
    │          ●
 50 ┤      ●
    │  ●
  0 ┼●
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         50  100  150  200  250  300  350  400  450
                    Kümülatif Yem Tüketimi (g)

📊 Grafik Türü: Scatter Plot with trend line
📈 Veri: weightGain vs cumulativeFeed
🎨 Renk: Mor (#9C27B0)
📐 Eğim = Feed Efficiency (FE)
```

### 5.3 Vücut Kompozisyonu Grafikleri

#### Grafik 5: Kompozisyon Değişimi (Stacked Area)
```
Ağırlık (g)
    │
300 ┤████████████████████████████████████████████████
    │████████████████████████████████████  Su
250 ┤███████████████████████████████
    │██████████████████████████
200 ┤█████████████████████
    │████████████████  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
150 ┤███████████  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Yağ
    │██████  ▓▓▓▓▓▓▓▓▓▓▓▓
100 ┤███  ▓▓▓▓▓▓▓▓  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │▓▓  ░░░░░░░░░░░░░░░░░░░░░░░░  Protein
 50 ┼░░░░░░░░░░░░░░░░
    │░░░░░░░░
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         10   20   30   40   50   60   70   80   90   Gün

📊 Grafik Türü: Stacked Area Chart
📈 Veri: protein, lipid, water, ash vs time
🎨 Renkler: Protein(Kırmızı), Yağ(Sarı), Su(Mavi), Kül(Gri)
```

#### Grafik 6: Kompozisyon Yüzdeleri (Pie Chart)
```
          Başlangıç (50g)              Son (150g)
        ┌─────────────────┐         ┌─────────────────┐
        │     ████████    │         │    ████████     │
        │   ██   Su   ██  │         │  ██   Su   ██   │
        │  █  (72%)    █  │         │ █  (70%)    █   │
        │ █            █  │         │█            █   │
        │█ ▓▓Prot▓▓    █  │         │ ▓▓Prot▓▓    █   │
        │█ (16%)       █  │         │ (16%)       █   │
        │ █ ░Yağ░     █   │         │█ ░Yağ░     █    │
        │  █ (8%)   █     │         │ █ (10%)  █      │
        │   ██    ██      │         │  ██    ██       │
        │     ████        │         │    ████         │
        └─────────────────┘         └─────────────────┘

📊 Grafik Türü: Pie Chart (karşılaştırmalı)
📈 Veri: proteinPct, lipidPct, waterPct, ashPct
🎨 Renkler: Protein(Kırmızı), Yağ(Sarı), Su(Mavi), Kül(Gri)
```

### 5.4 Sıcaklık Etki Grafikleri

#### Grafik 7: Sıcaklık-Yem Alımı İlişkisi
```
Yem Alımı (g/gün)
    │
  8 ┤              ●●●●●●●●
    │           ●●●        ●●●
  6 ┤        ●●●              ●●●
    │      ●●                    ●●
  4 ┤    ●●                        ●●
    │  ●●                            ●●
  2 ┤●●                                ●●
    │                                    ●●
  0 ┼                                      ●
    └────┬────┬────┬────┬────┬────┬────┬────┬────▶
         8   12   16   20   24   28   32   36
                      Sıcaklık (°C)

📊 Grafik Türü: Bell Curve / Polynomial
📈 Veri: feedIntake vs temperature
🎨 Renk: Kırmızı (#F44336)
📍 Peak: Optimal sıcaklıkta (22°C)
⚠️ T_low ve T_high limitlerinde düşüş
```

#### Grafik 8: Sıcaklık Profili ve Büyüme
```
                Sıcaklık (°C)                    Ağırlık (g)
    30 ┤                                              ┤ 300
       │        ████████                              │
    25 ┤    ████        ████                      ●●●●┤ 250
       │████                ████              ●●●●    │
    20 ┤                        ████      ●●●●        ┤ 200
       │                            ████●●●●         │
    15 ┤                            ●●●●████         ┤ 150
       │                        ●●●●        ████     │
    10 ┤                    ●●●●                ████ ┤ 100
       │                ●●●●                        ████
     5 ┤            ●●●●                              ┤ 50
       │        ●●●●                                  │
       └────┬────┬────┬────┬────┬────┬────┬────┬────┬─┘
           J    F    M    A    M    J    J    A    S   Ay

📊 Grafik Türü: Dual-axis Line Chart
📈 Veri Sol: temperature vs month
📈 Veri Sağ: bodyWeight vs month
🎨 Renkler: Sıcaklık(Turuncu), Ağırlık(Mavi)
```

### 5.5 Metabolik Grafikler

#### Grafik 9: Enerji Bütçesi (Sankey Diagram)
```
                    FEEDNETICS Enerji Akışı

    ┌──────────────────────────────────────────────────────┐
    │                                                      │
    │  Yem Enerjisi (100%)                                 │
    │       │                                              │
    │       ├──────────────────────► Dışkı (15%)           │
    │       │                                              │
    │       ▼                                              │
    │  Sindirilebilir Enerji (85%)                         │
    │       │                                              │
    │       ├──────────────────────► İdrar + Solungaç (8%) │
    │       │                                              │
    │       ▼                                              │
    │  Metabolize Edilebilir Enerji (77%)                  │
    │       │                                              │
    │       ├──────────────────────► Isı (SDA) (12%)       │
    │       │                                              │
    │       ▼                                              │
    │  Net Enerji (65%)                                    │
    │       │                                              │
    │       ├──────────────────────► Bazal Metabolizma (20%)
    │       │                                              │
    │       ▼                                              │
    │  Büyüme için Enerji (45%)                            │
    │       │                                              │
    │       ├───────► Protein Sentezi (25%)                │
    │       │                                              │
    │       └───────► Yağ Depolama (20%)                   │
    │                                                      │
    └──────────────────────────────────────────────────────┘

📊 Grafik Türü: Sankey Diagram
📈 Veri: energyPartitioning
🎨 Gradient: Yeşil → Sarı → Kırmızı
```

#### Grafik 10: ATP Üretim Kaynakları
```
         Amino Asit       Yağ Asidi       Glikoz
              │               │              │
              ▼               ▼              ▼
        ┌─────────┐     ┌─────────┐    ┌─────────┐
        │  %35    │     │  %55    │    │  %10    │
        │  ATP    │     │  ATP    │    │  ATP    │
        └─────────┘     └─────────┘    └─────────┘
              │               │              │
              └───────────────┼──────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Toplam ATP    │
                    │   Üretimi       │
                    │   (µmol/g/h)    │
                    └─────────────────┘

📊 Grafik Türü: Donut Chart veya Stacked Bar
📈 Veri: ATP_from_AA, ATP_from_FA, ATP_from_glucose
🎨 Renkler: AA(Kırmızı), FA(Sarı), Glikoz(Mavi)
```

### 5.6 Karşılaştırma Grafikleri

#### Grafik 11: Farklı Yemler Karşılaştırması
```
                    Yem A    Yem B    Yem C
                   (%45P)   (%42P)   (%48P)
                      │        │        │
    Büyüme (g)    ────█████────██████───████────
                      250      280      230

    FCR           ────███─────██──────████─────
                      1.4      1.2      1.5

    Maliyet (€/kg)────████────███─────██───────
                      2.1      1.8      2.4

    PRE (%)       ────████────█████───███──────
                      42       48       38

📊 Grafik Türü: Grouped Bar Chart
📈 Veri: metrics per feed type
🎨 Renkler: Yem A(Mavi), B(Yeşil), C(Turuncu)
```

#### Grafik 12: Model Tahmin vs Gerçek
```
Tahmin Edilen Ağırlık (g)
    │
300 ┤                                          ●
    │                                      ●
250 ┤                                  ●
    │                              ●
200 ┤                          ●            R² = 0.94
    │                      ●               MAPE = 12%
150 ┤                  ●
    │              ●
100 ┤          ●
    │      ●
 50 ┤  ●
    │
    └────┬────┬────┬────┬────┬────┬────┬────┬────┬────▶
         50  100  150  200  250  300  350
              Gözlemlenen Ağırlık (g)

📊 Grafik Türü: Scatter Plot with 1:1 line
📈 Veri: predicted vs observed
🎨 Noktalar: Mavi, 1:1 çizgisi: Kırmızı (kesikli)
📐 İstatistikler: R², MAPE, RMSE göster
```

### 5.7 Zaman Serisi Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│                    FEEDNETICS Dashboard - Gün 45                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │ Mevcut Ağırlık       │  │ Bugünkü Büyüme       │                   │
│  │     125.4 g          │  │     2.8 g/gün        │                   │
│  │     ▲ +150%          │  │     ▼ -0.2 g/gün     │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │ Kümülatif FCR        │  │ Su Sıcaklığı         │                   │
│  │     1.25             │  │     23.5°C           │                   │
│  │     ◄► Normal        │  │     ✓ Optimal        │                   │
│  └──────────────────────┘  └──────────────────────┘                   │
│                                                                        │
│  Büyüme Eğrisi                      Kompozisyon                       │
│  ┌─────────────────────────────┐   ┌─────────────────────────────┐   │
│  │     ●●●●●●●●                │   │  ██████████████████████████ │   │
│  │   ●●        ← Şimdi         │   │  ████ Su: 70% ████████████ │   │
│  │ ●●                          │   │  ▓▓▓▓ Prot: 16% ▓▓▓▓▓▓▓▓▓ │   │
│  │●                            │   │  ░░░░ Yağ: 10% ░░░░░░░░░░ │   │
│  └─────────────────────────────┘   └─────────────────────────────┘   │
│                                                                        │
│  Enerji Dengesi (bugün)                                               │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Alım ████████████████████████████████████████ 100%           │    │
│  │ Büyüme █████████████████████████ 45%                         │    │
│  │ Bakım ██████████████████ 35%                                 │    │
│  │ Kayıp ████████ 20%                                           │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Örnek Senaryolar

### 6.1 Çipura Büyüme Simülasyonu

```typescript
import {
  calculateFeedIntake,
  calculateDigestion,
  calculateBodyComposition,
  calculateEnergyModel,
  calculateNitrogenMetabolism,
  calculateCarbonMetabolism,
  calculatePerformanceIndicators
} from './formulas';

// Başlangıç koşulları
const initialState = {
  bodyWeight: 50,        // g
  protein: 8.2,          // g
  lipid: 4.1,            // g
  glycogen: 0.3,         // g
  temperature: 22,       // °C
  species: 'gilthead_seabream'
};

// Yem özellikleri
const feed = {
  protein: 0.45,         // %45
  lipid: 0.18,           // %18
  grossEnergy: 21,       // MJ/kg
  digestibility: {
    protein: 0.92,
    lipid: 0.95,
    energy: 0.88
  }
};

// 90 günlük simülasyon
const results = runSimulation(initialState, feed, 90);

// Beklenen çıktılar:
// - Son ağırlık: ~150 g
// - SGR: 1.2-1.8 %/gün
// - FCR: 1.3-1.5
// - PRE: 40-45%
```

### 6.2 Sıcaklık Optimizasyonu

```typescript
// Farklı sıcaklıklar için simülasyon
const temperatures = [18, 20, 22, 24, 26, 28];
const results = temperatures.map(T => ({
  temperature: T,
  ...runSimulation({...initialState, temperature: T}, feed, 90)
}));

// Beklenen sonuçlar:
// T=18°C: SGR=1.0%, FCR=1.6
// T=20°C: SGR=1.4%, FCR=1.4
// T=22°C: SGR=1.8%, FCR=1.2  ← Optimal
// T=24°C: SGR=1.6%, FCR=1.3
// T=26°C: SGR=1.2%, FCR=1.5
// T=28°C: SGR=0.8%, FCR=1.8
```

### 6.3 Yem Formülasyonu Karşılaştırması

```typescript
const feeds = [
  { name: 'Ekonomik', protein: 0.40, lipid: 0.15, price: 1.2 },
  { name: 'Standart', protein: 0.45, lipid: 0.18, price: 1.5 },
  { name: 'Premium', protein: 0.50, lipid: 0.22, price: 2.0 }
];

const comparison = feeds.map(feed => {
  const sim = runSimulation(initialState, feed, 90);
  return {
    feed: feed.name,
    finalWeight: sim.finalWeight,
    fcr: sim.fcr,
    feedCost: sim.totalFeed * feed.price,
    costPerKg: (sim.totalFeed * feed.price) / (sim.weightGain / 1000)
  };
});

// Sonuç tablosu:
// ┌──────────┬─────────┬───────┬───────────┬────────────┐
// │ Yem      │ Son (g) │ FCR   │ Yem €     │ €/kg balık │
// ├──────────┼─────────┼───────┼───────────┼────────────┤
// │ Ekonomik │ 130     │ 1.55  │ 1.48      │ 1.85       │
// │ Standart │ 150     │ 1.35  │ 2.03      │ 2.03       │
// │ Premium  │ 165     │ 1.22  │ 2.80      │ 2.43       │
// └──────────┴─────────┴───────┴───────────┴────────────┘
```

---

## 7. API Kullanımı

### 7.1 Temel Fonksiyonlar

```typescript
// Yem alımı hesaplama
const feedIntake = calculateMaxFeedIntake(
  bodyWeight,    // g
  temperature,   // °C
  params         // FeedIntakeParams
);

// Sindirim hesaplama
const digested = calculateNutrientAbsorption(
  feedIntake,    // g/gün
  feedComp,      // FeedComposition
  adc            // ADCValues
);

// Enerji modeli
const energy = calculateEnergyPartitioning(
  digestedEnergy,
  maintenance,
  activity,
  growth
);

// Büyüme hesaplama
const growth = calculateProteinSynthesis(
  availableAA,
  ribosomeActivity,
  temperature
);
```

### 7.2 Tam Simülasyon Örneği

```typescript
import * as feednetics from './formulas';

async function runFullSimulation(config: SimulationConfig) {
  const results: DailyResult[] = [];
  let state = initializeState(config);

  for (let day = 0; day < config.days; day++) {
    // Günlük hesaplamalar
    const dailyResult = feednetics.simulateDay(state, config.feed, config.environment);

    // Durum güncelle
    state = dailyResult.newState;
    results.push(dailyResult);

    // İlerleme raporu
    if (day % 10 === 0) {
      console.log(`Gün ${day}: Ağırlık = ${state.bodyWeight.toFixed(1)}g`);
    }
  }

  return {
    dailyResults: results,
    summary: calculateSummary(results),
    charts: generateCharts(results)
  };
}
```

### 7.3 Grafik Veri Formatları

```typescript
// Büyüme eğrisi için veri
interface GrowthChartData {
  labels: string[];           // Gün numaraları
  datasets: [{
    label: 'Ağırlık (g)',
    data: number[],
    borderColor: '#2196F3',
    fill: false
  }]
}

// Kompozisyon için veri
interface CompositionChartData {
  labels: string[];
  datasets: [
    { label: 'Protein', data: number[], backgroundColor: '#F44336' },
    { label: 'Yağ', data: number[], backgroundColor: '#FFC107' },
    { label: 'Su', data: number[], backgroundColor: '#2196F3' }
  ]
}

// Performans karşılaştırması için veri
interface ComparisonChartData {
  categories: string[];       // ['Büyüme', 'FCR', 'PRE', 'Maliyet']
  series: Array<{
    name: string,
    data: number[]
  }>
}
```

---

## Ekler

### Ek A: Grafik Kütüphanesi Önerileri

| Kütüphane | Kullanım Alanı | Özellikler |
|-----------|----------------|------------|
| **Chart.js** | Temel grafikler | Hafif, kolay, responsive |
| **D3.js** | Özel görselleştirmeler | Güçlü, esnek, karmaşık |
| **Recharts** | React uygulamaları | Bildirimsel, composable |
| **Plotly** | Bilimsel grafikler | 3D, interaktif, export |
| **ECharts** | Dashboard'lar | Zengin, performanslı |

### Ek B: Renk Paleti Önerisi

```
Ana Renkler:
├── Birincil: #2196F3 (Mavi) - Ağırlık, su
├── İkincil: #4CAF50 (Yeşil) - Büyüme, pozitif
├── Üçüncül: #FF9800 (Turuncu) - Sıcaklık, uyarı
└── Dördüncül: #F44336 (Kırmızı) - Protein, kritik

Kompozisyon Renkleri:
├── Protein: #E91E63 (Pembe-Kırmızı)
├── Yağ: #FFC107 (Sarı)
├── Su: #03A9F4 (Açık Mavi)
└── Kül: #9E9E9E (Gri)

Durum Renkleri:
├── Optimal: #4CAF50 (Yeşil)
├── Normal: #2196F3 (Mavi)
├── Dikkat: #FF9800 (Turuncu)
└── Kritik: #F44336 (Kırmızı)
```

### Ek C: Dashboard Widget Listesi

1. **KPI Kartları**: Anlık metrikler (ağırlık, SGR, FCR, sıcaklık)
2. **Büyüme Grafiği**: Zaman serisi çizgi grafiği
3. **Kompozisyon Pastası**: Vücut bileşimi yüzdeleri
4. **Enerji Sankey**: Enerji akış diyagramı
5. **Sıcaklık Gauge**: Mevcut sıcaklık göstergesi
6. **FCR Trend**: Yem verimliliği trendi
7. **Tahmin vs Gerçek**: Model doğrulama scatter plot
8. **Yem Karşılaştırma**: Çoklu bar chart
9. **Amino Asit Dengesi**: Radar chart
10. **Ekonomik Özet**: Tablo widget

---

*Bu dokümantasyon FEEDNETICS modelinin pratik kullanımını açıklar.*
*Matematiksel formüller için: [FEEDNETICS_FORMULAS.md](./FEEDNETICS_FORMULAS.md)*
*Değişken referansı için: [VARIABLES_REFERENCE.md](./VARIABLES_REFERENCE.md)*
