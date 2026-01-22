# FEEDNETICS Model - Formül ve Değişken Dokümantasyonu

Bu belge, [MDPI makalesi](https://www.mdpi.com/2077-1312/11/3/472) "Development and Application of a Mechanistic Nutrient-Based Model for Precision Fish Farming" makalesindeki FEEDNETICS modelinin formüllerini ve değişkenlerini içermektedir.

---

## 1. Temel Enerji Denge Denklemi (Energy Balance Equation)

Balık biyoenerjetik modellerinin temeli, termodinamiğin ikinci yasasına dayanır:

```
C = R + A + SDA + F + U + G
```

veya basitleştirilmiş formu:

```
C = G + (M + SDA) + F + U
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **C** | Tüketim (Consumption) - Alınan enerji | J/gün |
| **R** | Bazal/Standart metabolizma (Respiration) | J/gün |
| **A** | Aktif metabolizma - Hareket için enerji | J/gün |
| **SDA** | Spesifik Dinamik Aksiyon - Sindirim maliyeti | J/gün |
| **F** | Dışkı ile atım (Egestion/Fecal) | J/gün |
| **U** | İdrar ile atım (Excretion/Urinary) | J/gün |
| **G** | Büyüme (Growth) - Somatik ve/veya gonadal | J/gün |
| **M** | Toplam metabolizma (M = R + A) | J/gün |

### Formül İlişkileri:

```
┌──────────────────────────────────────────────────────────────┐
│                    ENERJİ GİRİŞİ (C)                         │
│                         ↓                                     │
│    ┌─────────────┬─────────────┬─────────────┐               │
│    ↓             ↓             ↓             ↓               │
│ Metabolizma   Sindirim      Atıklar      BÜYÜME (G)          │
│ (R + A)       (SDA)         (F + U)         │                │
│                                              ↓                │
│                                    ┌─────────────────┐       │
│                                    │ Protein (Pd)    │       │
│                                    │ Lipit (Ld)      │       │
│                                    │ Karbonhidrat    │       │
│                                    └─────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Büyüme Oranı Formülleri

### 2.1 Spesifik Büyüme Oranı (SGR - Specific Growth Rate)

```
SGR = (e^g - 1) × 100

g = [ln(W₂) - ln(W₁)] / (t₂ - t₁)
```

veya yaygın form:

```
SGR = [(ln(W_final) - ln(W_initial)) / gün] × 100
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **SGR** | Spesifik Büyüme Oranı | %/gün |
| **W₁, W₂** | Başlangıç ve bitiş ağırlıkları | g |
| **t₁, t₂** | Başlangıç ve bitiş zamanları | gün |
| **g** | Anlık büyüme oranı | 1/gün |

### 2.2 Termal Büyüme Katsayısı (TGC - Thermal Growth Coefficient)

```
TGC = [(W_final^(1/3) - W_initial^(1/3)) / Σ(T × gün)] × 1000
```

veya alternatif form:

```
TGC = (W₂^(1/3) - W₁^(1/3)) / (derece-gün)
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **TGC** | Termal Büyüme Katsayısı | birimsiz |
| **W_initial** | Başlangıç ağırlığı | g |
| **W_final** | Final ağırlık | g |
| **T** | Ortalama günlük su sıcaklığı | °C |
| **derece-gün** | Sıcaklık × zaman toplamı | °C·gün |

### 2.3 TGC ve SGR İlişkisi

TGC, SGR'nin fonksiyonu olarak ifade edilebilir:
- SGR sıcaklığa ve başlangıç ağırlığına bağımlıdır
- TGC bu bağımlılıkları normalize eder

---

## 3. Diferansiyel Büyüme Denklemi

### Von Bertalanffy Büyüme Denklemi

```
dW/dt = a₁·W^m - b·W^n
```

veya genel metabolik form:

```
dm/dt = H·m^A - K·m^B
```

### Değişkenler:

| Değişken | Açıklama | Tipik Değer |
|----------|----------|-------------|
| **W, m** | Vücut kütlesi | g |
| **t** | Zaman | gün |
| **a₁** | Anabolik (enerji kazanım) katsayısı | türe özgü |
| **b** | Katabolik (enerji kaybı) katsayısı | türe özgü |
| **m** | Anabolik üs (metabolik yüzey) | ~0.67-0.75 |
| **n** | Katabolik üs | ~1.0 |
| **H** | Sentez (yapım) oranı | türe özgü |
| **K** | Yıkım oranı | türe özgü |
| **A** | Anabolik metabolik üs | 2/3 |
| **B** | Katabolik metabolik üs | 1 |

### Fiziksel Anlam:

- **a₁·W^m**: Enerji kazanım oranı (yem alımı, sindirim, absorpsiyon)
- **b·W^n**: Enerji kaybı oranı (solunum, aktivite, atık)
- **dW/dt > 0**: Büyüme gerçekleşiyor
- **dW/dt = 0**: Bakım durumu (büyüme yok)
- **dW/dt < 0**: Ağırlık kaybı

---

## 4. Protein ve Lipit Biriktirme Formülleri

### 4.1 Protein Biriktirme (Pd - Protein Deposition)

```
Pd = Pd_max × (1 - e^(-k_p × (DPI - DPI_maintenance)))
```

Çipura (*Sparus aurata*) için spesifik model:

```
PD = 2.97 × (1 - e^(-0.152 × (DPI - 1.393)))
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **Pd** | Protein biriktirme oranı | g/gün |
| **Pd_max** | Maksimum protein biriktirme | g/gün |
| **DPI** | Sindirilebilir protein alımı | g·kg^(-0.7)·gün^(-1) |
| **DPI_maintenance** | Bakım için protein ihtiyacı | g·kg^(-0.7)·gün^(-1) |
| **k_p** | Protein biriktirme katsayısı | birimsiz |

### 4.2 Lipit Biriktirme (Ld - Lipid Deposition)

```
Ld = (ME_intake - ME_maintenance - E_protein) / E_lipid
```

veya:

```
Ld = (DEI - ME_m - (Pd × e_p)) / e_l
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **Ld** | Lipit biriktirme oranı | g/gün |
| **ME_intake** | Metabolize edilebilir enerji alımı | kJ/gün |
| **ME_maintenance** | Bakım enerji ihtiyacı | kJ/gün |
| **E_protein** | Protein sentezi için enerji | kJ/gün |
| **e_p** | Protein biriktirme enerji maliyeti | kJ/g protein |
| **e_l** | Lipit biriktirme enerji maliyeti | kJ/g lipit |

### 4.3 Enerji Geri Kazanımı (ER - Energy Recovery)

Çipura için:

```
ER = 173.1 × (1 - e^(-0.00407 × (DEI - 59.84)))
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **ER** | Enerji geri kazanımı | kJ·kg^(-0.82)·gün^(-1) |
| **DEI** | Sindirilebilir enerji alımı | kJ·kg^(-0.82)·gün^(-1) |
| **59.84** | Bakım enerji ihtiyacı | kJ·kg^(-0.82)·gün^(-1) |

---

## 5. Bakım (Maintenance) Formülleri

### 5.1 Enerji İçin Bakım İhtiyacı

```
ME_maintenance = a × W^b
```

Balıklarda tipik değerler:
- **b ≈ 0.80** (metabolik ağırlık üssü)

### 5.2 Protein İçin Bakım İhtiyacı

```
P_maintenance = a × W^0.70
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **ME_maintenance** | Bakım metabolik enerjisi | kJ/gün |
| **P_maintenance** | Bakım protein ihtiyacı | g/gün |
| **W** | Vücut ağırlığı | kg |
| **a** | Türe özgü sabit | değişken |
| **b** | Metabolik üs | 0.70-0.82 |

### Çipura İçin Bakım Değerleri (Yaz Koşulları):

| Parametre | Değer | Birim |
|-----------|-------|-------|
| Protein bakım | 1.393 | g·kg^(-0.7)·gün^(-1) |
| Enerji bakım | 59.84 | kJ·kg^(-0.82)·gün^(-1) |

---

## 6. Protein Tutulumu Verimliliği (PRE)

```
PRE (%) = 18.90 + 22.90 × [1 + (DPI × 6.63^(-1))^39.68]^(-1)
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **PRE** | Protein Tutulumu Verimliliği | % |
| **DPI** | Sindirilebilir protein alımı | g·kg^(-0.7)·gün^(-1) |

### PRE ve Büyüme İlişkisi:

```
Ağırlık kazancı (g/gün) = 1.86 + [6.09 × Pd (g/gün)]
```

---

## 7. Sıcaklık Etkisi Formülleri

### 7.1 Arrhenius Tipi Sıcaklık Düzeltmesi

```
k(T) = k_ref × e^[Ta × (1/T_ref - 1/T)]
```

### 7.2 Q10 Yaklaşımı

```
k(T) = k_ref × Q10^((T - T_ref)/10)
```

### Değişkenler:

| Değişken | Açıklama | Birim |
|----------|----------|-------|
| **k(T)** | Sıcaklığa bağlı oran sabiti | değişken |
| **k_ref** | Referans sıcaklıkta oran sabiti | değişken |
| **T** | Gerçek sıcaklık | K veya °C |
| **T_ref** | Referans sıcaklık | K veya °C |
| **Ta** | Arrhenius sıcaklığı | K |
| **Q10** | 10°C artışta oran değişimi | birimsiz (~2-3) |

---

## 8. Amino Asit Gereksinimleri

### 8.1 Esansiyel Amino Asit (EAA) İhtiyacı

EAA ihtiyacı şunlara bağlıdır:
- Tür (trofik seviye)
- Sıcaklık
- Büyüme oranı
- Protein sentez verimliliği

### 8.2 Amino Asit Skoru

```
AAS = (Test proteindeki AA miktarı / Referans proteindeki AA miktarı) × 100
```

---

## 9. Atık Üretimi Formülleri

### 9.1 Azot Atığı

```
N_waste = N_intake - N_retention

N_intake = (Yem × Protein içeriği) / 6.25

N_retention = (Balık N içeriği × Ağırlık kazancı)
```

### 9.2 Fosfor Atığı

```
P_waste = P_intake - P_retention
```

### Çipura Vücut Kompozisyonu:

| Bileşen | Değer | Birim |
|---------|-------|-------|
| Azot | 28.5 | g·kg^(-1) vücut kütlesi |
| Fosfor | 7.2 | g·kg^(-1) vücut kütlesi |

---

## 10. Model Yapısı ve Formül Bağlantıları

```
                        ┌─────────────────────────────┐
                        │     YEM KOMPOZİSYONU        │
                        │  - Protein                  │
                        │  - Lipit                    │
                        │  - Karbonhidrat             │
                        │  - Amino Asitler            │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      SİNDİRİM VE ABSORPSIYON                     │
│                                                                   │
│  DPI = Protein alımı × Sindirilebilirlik                         │
│  DEI = Enerji alımı × Sindirilebilirlik                          │
│                                                                   │
│  Sindirim kayıpları: F (dışkı)                                   │
└──────────────────────────────────────┬───────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                     METABOLİK SÜREÇLER                           │
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                      │
│  │ BAKIM           │    │ BÜYÜME          │                      │
│  │                 │    │                 │                      │
│  │ ME_m = a×W^0.82 │    │ Pd = f(DPI)     │                      │
│  │ P_m = a×W^0.70  │    │ Ld = f(DEI-ME_m)│                      │
│  └────────┬────────┘    └────────┬────────┘                      │
│           │                      │                               │
│           ▼                      ▼                               │
│  ┌─────────────────────────────────────────┐                     │
│  │         ENERJİ PAYLAŞIMI                │                     │
│  │                                         │                     │
│  │  DEI = ME_m + E_protein + E_lipid + SDA │                     │
│  └─────────────────────────────────────────┘                     │
│                                                                   │
│  Metabolik kayıplar: U (idrar), CO2, NH3                         │
└──────────────────────────────────────┬───────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BÜYÜME ÇIKTISI                              │
│                                                                   │
│  dW/dt = Pd + Ld + ...                                           │
│                                                                   │
│  Vücut Kompozisyonu:                                             │
│  - Protein içeriği                                               │
│  - Lipit içeriği                                                 │
│  - Nem                                                           │
│  - Kül                                                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. FEEDNETICS Modeli Özellikleri

### Model Tipi
- **Mekanistik Besin Bazlı Model** (Metabolik-flux modeli)
- Deterministik diferansiyel denklemler
- Bireysel düzeyde simülasyon + çiftlik ölçeğine ölçekleme

### Kalibre Edilmiş Türler
1. Çipura (*Sparus aurata*)
2. Levrek (*Dicentrarchus labrax*)
3. Atlantik Somon (*Salmo salar*)
4. Gökkuşağı Alabalığı (*Oncorhynchus mykiss*)
5. Nil Tilapyası (*Oreochromis niloticus*)

### Model Performansı
- **MAPE** (Ortalama Mutlak Yüzde Hatası): %11.7 - %13.8

### Kullanım Alanları
- Yem formülasyonu değerlendirme
- Sıcaklık profili etkisi analizi
- Uzun vadeli üretim performansı tahmini
- Besleme stratejisi optimizasyonu

---

## 12. Referanslar

1. Soares, F.M.R.C., et al. (2023). "Development and Application of a Mechanistic Nutrient-Based Model for Precision Fish Farming." *J. Mar. Sci. Eng.* 11(3):472. [DOI: 10.3390/jmse11030472](https://www.mdpi.com/2077-1312/11/3/472)

2. Lupatsch, I., et al. (1998). "Energy and protein requirements for maintenance and growth in gilthead seabream." *Aquaculture Nutrition* 4:165-173.

3. Jobling, M. (2003). "The thermal growth coefficient (TGC) model of fish growth: a cautionary note." *Aquaculture Research* 34:581-584.

4. Von Bertalanffy, L. (1957). "Quantitative laws in metabolism and growth." *The Quarterly Review of Biology* 32:217-231.

5. Hartman, K.J. & Hayward, R.S. "Bioenergetics." Chapter 12 in *Fish Bioenergetics*.

---

## Özet Tablo: Anahtar Formüller

| # | Formül | Çıktı | Kullanım |
|---|--------|-------|----------|
| 1 | C = R + A + SDA + F + U + G | Enerji dengesi | Temel çerçeve |
| 2 | SGR = (ln(W₂)-ln(W₁))/t × 100 | Büyüme oranı (%) | Performans ölçümü |
| 3 | TGC = (W₂^⅓-W₁^⅓)/derece-gün | Normalleştirilmiş büyüme | Türler arası karşılaştırma |
| 4 | dW/dt = a₁·W^m - b·W^n | Anlık büyüme | Dinamik simülasyon |
| 5 | Pd = Pd_max×(1-e^(-k×(DPI-DPI_m))) | Protein biriktirme | Besin modelleme |
| 6 | Ld = (DEI-ME_m-E_p)/e_l | Lipit biriktirme | Vücut kompozisyonu |
| 7 | PRE = f(DPI) | Protein verimliliği | Yem değerlendirme |
| 8 | ME_m = a×W^b | Bakım enerjisi | İhtiyaç hesaplama |

---

*Bu belge, web kaynaklarından derlenen bilgilerle oluşturulmuştur. Tam formül ve parametre değerleri için orijinal makaleye başvurunuz.*
