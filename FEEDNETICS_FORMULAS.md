# FEEDNETICS Model - Mathematical Formulations

> **Source:** Soares, F.M.R.C. et al. (2023). "Development and Application of a Mechanistic Nutrient-Based Model for Precision Fish Farming." *Journal of Marine Science and Engineering*, 11, 472. https://doi.org/10.3390/jmse11030472

## Table of Contents

1. [Model Calibration and Validation Metrics](#1-model-calibration-and-validation-metrics)
1. [Model Inputs](#2-model-inputs)
1. [Feed Intake Control](#3-feed-intake-control)
1. [Gut Compartment - Digestion and Absorption](#4-gut-compartment---digestion-and-absorption)
1. [Body Weight and Composition](#5-body-weight-and-composition)
1. [Energetic Model](#6-energetic-model)
1. [Nitrogen Metabolism](#7-nitrogen-metabolism)
- [Protein Synthesis](#71-protein-synthesis)
- [Protein Degradation](#72-protein-degradation)
- [Amino Acid Oxidation](#73-amino-acid-oxidation)
- [Gluconeogenesis](#74-gluconeogenesis)
- [Non-Essential Amino Acid Synthesis](#75-non-essential-amino-acid-synthesis)
1. [Carbon Metabolism](#8-carbon-metabolism)
- [Glucose Oxidation](#81-glucose-oxidation)
- [Glycogenesis and Glycogenolysis](#82-glycogenesis-and-glycogenolysis)
- [Lipogenesis](#83-lipogenesis)
- [Beta-Oxidation](#84-beta-oxidation)
1. [Performance Indicators](#9-performance-indicators)
1. [Calibration Data Ranges](#10-calibration-data-ranges)

-----

## 1. Model Calibration and Validation Metrics

### Mean Absolute Percentage Error (MAPE) - Calibration

**Equation (1)**
$$MAPE_{cal_{bw}}(\%) = \frac{100}{n} \sum_{i=1}^{n} \left| \frac{P_{bw_i} - O_{bw_i}}{O_{bw_i}} \right|$$

**Where:**

- $P_{bw_i}$ = predicted body weight value (g)
- $O_{bw_i}$ = observed body weight value (g)
- $n$ = number of predicted-observed value pairs

### Cumulative Absolute Error (CAE)

**Equation (2)**
$$CAE_{bw}(g) = \sum_{i=1}^{n} |P_{bw_i} - O_{bw_i}|$$

### Crude Lipids Weighted Error (WECL)

**Equation (3)**
$$WE_{CL} = \frac{1}{m} \sum_{j=1}^{m} \left( CL_{ref} - CL_{predicted} \right)^2 \times 0.1$$

**Where:**

- $CL_{predicted}$ = predicted whole-body crude lipids content (%)
- $CL_{ref}$ = reference value for whole-body crude lipids content (%) from quantile regression
- $m$ = number of time steps

### Mean Absolute Percentage Error (MAPE) - Validation

**Equation (4)**
$$MAPE_{val_{bw}}(\%) = \frac{100}{n} \sum_{i=1}^{n} \left| \frac{P_{bw_i} - O_{bw_i}}{O_{bw_i}} \right|$$

-----

## 2. Model Inputs

The FEEDNETICS model is driven by three time-dependent inputs (resolution: 0.01 days):

### 2.1 Temperature

- **Input:** Daily temperature average (°C) and daily temperature amplitude
- **Processing:** Sinusoidal curve generated assuming lowest temperature at midnight

### 2.2 Feed Given

- **Input:** g/day or feeding table (% body weight/day per fish weight class and temperature class)
- **Processing:** Daily feed distributed using meal frequency and timing parameters

### 2.3 Feed Properties

|Category                                  |Attributes                                                       |
|------------------------------------------|-----------------------------------------------------------------|
|Macronutrient composition                 |Crude protein, crude lipids, ash, fiber, gross energy, phosphorus|
|Apparent digestibility coefficients (ADCs)|Crude protein, crude lipids, gross energy, phosphorus            |
|Amino acid profile                        |20 proteinogenic amino acids                                     |
|Fatty acid profile                        |20 different fatty acids                                         |

-----

## 3. Feed Intake Control

### Maximum Feed Intake (Original Lupatsch Model)

**Equation (A.1)**
$$FI_{max} = a \times BW^b \times e^{cT} \times I(T > T_{low}) \times I(T < T_{high})$$

**Where:**

- $FI_{max}$ = maximum feed intake (g/day)
- $a, b, c, T_{low}, T_{high}$ = species-specific parameters
- $BW$ = fish body weight (g)
- $T$ = current temperature (°C)
- $I$ = indicator function (returns 1 if true, 0 if false)

### Maximum Feed Intake (Smooth Approximation)

**Equation (A.2)**
$$FI_{max} = a \times BW^b \times e^{cT} \times \frac{1}{1 + \left(\frac{T_{low}}{T}\right)^\beta} \times \frac{1}{1 + \left(\frac{T}{T_{high}}\right)^\beta}$$

### Actual Feed Intake

**Equation (A.3)**
$$FI = \min(FI_{max}, feed_{given})$$

-----

## 4. Gut Compartment - Digestion and Absorption

### Digestible Nutrient Intake

**Equation (A.4)**
$$DI_{nutrient} = \frac{FI \times ADC_{nutrient} \times feed_{nutrient}}{Mw_{nutrient}}$$

**Where:**

- $DI_{nutrient}$ = digestible intake of a nutrient per unit time (mol/day)
- $ADC_{nutrient}$ = apparent digestibility coefficient of the nutrient
- $feed_{nutrient}$ = percentage of nutrient in the feed
- $Mw_{nutrient}$ = molecular weight of the nutrient

### Digestion Rate (Second-order Kinetics)

**Equation (A.5)**
$$digestion_{nutrient} = k_{digestion} \times enzyme \times digestible_{nutrient}$$

### Absorption Rate (Second-order Kinetics)

**Equation (A.6)**
$$absorption_{nutrient} = k_{absorption} \times receptor \times digested_{nutrient}$$

### Enzyme Dynamics

**Equation (A.7)**
$$\frac{d(enzyme)}{dt} = \left( k_{enz\_prod} \times \sum_{nutrient} digestible_{nutrient} \right) - k_{enz\_deg} \times enzyme$$

**Where:**

- $k_{enz\_prod}$ = enzyme production rate constant
- $k_{enz\_deg}$ = enzyme degradation rate constant

### Receptor Dynamics

**Equation (A.8)**
$$\frac{d(receptor)}{dt} = \left( k_{rec\_prod} \times \sum_{nutrient} digested_{nutrient} \right) - k_{rec\_deg} \times receptor$$

**Where:**

- $k_{rec\_prod}$ = receptor production rate constant
- $k_{rec\_deg}$ = receptor degradation rate constant

-----

## 5. Body Weight and Composition

### Total Protein (Amino Acid Equivalents)

**Equation (A.9)**
$$protein_{total} = \sum_{i=1}^{20} protein_{AA_i} \times AA\_Mw_i$$

**Where:**

- $protein_{AA_i}$ = mass of the i-th amino acid in body protein pool (mol)
- $AA\_Mw_i$ = molecular weight of the i-th amino acid (g/mol)

### Total Lipids

**Equation (A.10)**
$$lipid_{total} = \sum_{i=1}^{20} (TAG\_body\_FA_i + TAG\_blood\_FA_i) \times FA\_Mw_i$$

**Where:**

- $TAG\_body\_FA_i$ = mass of i-th fatty acid in body lipids pool (mol)
- $TAG\_blood\_FA_i$ = mass of i-th fatty acid in blood lipids pool (mol)
- $FA\_Mw_i$ = molecular weight of i-th fatty acid (g/mol)

### Crude Lipids Control Variable (CLq)

**Equation (A.11)**
$$CL_q = \frac{1}{1 + \left(\frac{lipid_{ref}}{lipid_{total}}\right)^\beta}$$

**Where:**

- $lipid_{ref}$ = reference lipid level (interpolated based on fasting state between min and max reference values)
- $\beta$ = shape parameter

-----

## 6. Energetic Model

### ATP Expenditure

**Equation (A.12)**
$$ATP_{exp} = ATP_{cost\_anab} + \left(1 + fed_{scaling} \times feed\_cost\_scale\right) \times ATP_{cost\_basal}(BW, T)$$

**Where:**

- $ATP_{cost\_anab}$ = ATP costs from anabolic reactions
- $fed_{scaling}$ = value [0,1] representing fed state
- $feed\_cost\_scale$ = parameter controlling feeding costs
- $ATP_{cost\_basal}(BW, T)$ = basal energy costs

### Required ATP from Oxidation

**Equation (A.13)**
$$ATP_{req} = ATP_{exp} - ATP_{prod\_catab} - ATP_{prod\_glucox}$$

**Where:**

- $ATP_{prod\_catab}$ = ATP from energy-yielding metabolite conversion
- $ATP_{prod\_glucox}$ = ATP from glucose oxidation

### Amino Acid vs Fatty Acid Oxidation Balance

**Equation (A.14)**
$$m_{ox\_AA} = \frac{1 - CL_q}{CL_q} \times m_{ox\_FA}$$

### Total ATP from Oxidation

**Equation (A.15)**
$$ATP_{req} = m_{ox\_AA} \times ATP_{stoich\_AA} + m_{ox\_FA} \times ATP_{stoich\_FA}$$

**Where:**

- $ATP_{stoich\_AA}$ = profile-dependent ATP yield from amino acid oxidation (mol ATP/g)
- $ATP_{stoich\_FA}$ = profile-dependent ATP yield from fatty acid β-oxidation (mol ATP/g)

### Mass of Amino Acids Oxidized

**Equation (A.16)**
$$m_{ox\_AA} = \frac{ATP_{req}}{\frac{CL_q}{1-CL_q} \times ATP_{stoich\_FA} + ATP_{stoich\_AA}}$$

### Adjusted Amino Acid Oxidation

**Equation (A.17)**
$$m_{ox\_AA} = \max\left( \frac{ATP_{req}}{\frac{CL_q}{1-CL_q} \times ATP_{stoich\_FA} + ATP_{stoich\_AA}}, \quad min\_AA\_loss \right)$$

### Fatty Acid Beta-Oxidation Rate

**Equation (A.18)**
$$m_{ox\_FA} = \frac{ATP_{req} - ATP_{AA\_ox}}{ATP_{stoich\_FA}}$$

**Where:**

- $ATP_{AA\_ox}$ = ATP generated from amino acid oxidation

-----

## 7. Nitrogen Metabolism

### 7.1 Protein Synthesis

#### Maximum Protein Synthesis Rate

**Equation (A.19)**
$$max\_prot_{synth} = \min\left( k_{RNA} \times vs_T \times C_s \times protein_{total}, \quad lim\_prot_{synth} \right)$$

**Where:**

- $lim\_prot_{synth}$ = maximum rate limited by available substrate (free amino acids)
- $k_{RNA}$ = translation rate
- $vs_T$ = temperature effect on protein synthesis
- $C_s$ = transcription rate (RNA quantity per gram protein)

#### Temperature Effect on Protein Synthesis

**Equation (A.20)**
$$vs_T = temperature_{effect} \times T$$

#### Ribosome Activation

**Equation (A.21)**
$$ribo_{activation} = k_{ribo} \times ribo_{occupied} \times valve_{activation}$$

#### Ribosome Deactivation

**Equation (A.22)**
$$ribo_{deactivation} = k_{ribo} \times ribo_{unoccupied} \times valve_{deactivation}$$

#### Ribosome Dynamics

**Equation (A.23)**
$$\frac{d(ribo_{occupied})}{dt} = ribo_{deactivation} - ribo_{activation}$$

**Equation (A.24)**
$$\frac{d(ribo_{unoccupied})}{dt} = ribo_{activation} - ribo_{deactivation}$$

#### Ribosome Activity

**Equation (A.25)**
$$ribo_{act} = \frac{ribo_{unoccupied}}{ribo_{occupied} + ribo_{unoccupied}}$$

#### Translation Rate (kRNA)

**Equation (A.26)**
$$k_{RNA} = e^{(1-ribo_{act}) \times \ln(k_{RNA\_min}) + ribo_{act} \times \ln(k_{RNA\_max})}$$

#### Protein Synthesis Regulator

**Equation (A.27)**
$$prot\_synt_{regulator} = 0.05 + 0.95 \times \min\left(1, \max(0, CL_q + fed - starving)\right)$$

#### Amino Acid Synthesis Valve

**Equation (A.28)**
$$AA\_synt_{valv} = \min\left( \frac{1}{1 + \frac{1}{\left(\frac{AA_{free}}{ref_{AA\_free}}\right)^{AA\_synt\_beta}}} \right)$$

#### Actual Protein Synthesis Rate

**Equation (A.29)**
$$A\_prot_{synth} = max\_prot_{synth} \times prot\_synt_{regulator} \times AA\_synt_{valv}$$

-----

### 7.2 Protein Degradation

#### Maximum Protein Degradation

**Equation (A.30)**
$$max_{prot\_deg} = k_{deg} \times deg\_temp\_factor \times protein_{total}$$

#### Temperature Effect on Degradation

**Equation (A.31)**
$$deg\_temp\_factor = V_{db} + V_{dm} \times (temperature - T_{optimal})^2$$

**Where:**

- $V_{db}$, $V_{dm}$ = parameters
- $T_{optimal}$ = optimal temperature

#### Minimum Protein Degradation

**Equation (A.32)**
$$min\_prot_{deg} = prot\_deg\_min\_factor \times min\_AA\_loss$$

#### Amino Acid Degradation Valve

**Equation (A.33)**
$$AA\_deg_{valv} = \min\left( \frac{1}{1 + \left(\frac{AA_{free}}{ref_{AA\_free}}\right)^{AA\_deg\_beta\_2}} \right)^{AA\_deg\_beta\_1}$$

#### Actual Protein Degradation

**Equation (A.34)**
$$prot_{deg} = min_{prot\_deg} + (max_{prot\_deg} - min_{prot\_deg}) \times AA\_deg_{valv}$$

-----

### 7.3 Amino Acid Oxidation

#### Minimum Amino Acid Loss (Fasting Maintenance)

**Equation (A.35)**
$$min\_AA\_loss = req\_prot\_a \times e^{req\_prot\_b \times temperature} \times \left(\frac{bw}{1000}\right)^{req\_prot\_c}$$

**Where:**

- $req\_prot\_a$, $req\_prot\_b$, $req\_prot\_c$ = parameters

#### Normalized Free Amino Acids

**Equation (A.36)**
$$AA\_free\_max\_norm = \frac{AA_{free}}{max\_ref_{AA\_free}}$$

**Equation (A.37)**
$$AA\_free\_min\_norm = \frac{AA_{free}}{min\_ref_{AA\_free}}$$

#### Amino Acid Oxidation Valve

**Equation (A.38)**
$$AA\_ox_{valv} = \min\left( \frac{AA\_free\_max\_norm}{\sum AA\_free\_max\_norm}, \frac{AA\_free\_min\_norm}{\sum AA\_free\_min\_norm} \right)$$

#### Oxidation Weights

**Equation (A.39)**
$$AA\_ox_{weights} = \frac{AA\_ox_{valv}}{\sum AA\_ox_{valv}}$$

#### Amino Acid Oxidation Rate

**Equation (A.40)**
$$AA\_ox_{rate} = AA\_ox_{weights} \times m_{ox\_AA}$$

-----

### 7.4 Gluconeogenesis

#### Maximum Gluconeogenesis Rate

**Equation (A.41)**
$$V_{max\_gluconeo} = \min\left( AA\_gluco_{weights} \times stoich_{glucose_{AA \rightarrow glc}} \times a_{gluconeo} \times bw \times e^{b \times temperature}, \quad stoich_{glucose_{AA \rightarrow glc}} \times \frac{AA_{free}}{timestep} \right)$$

#### Actual Gluconeogenesis Rate

**Equation (A.42)**
$$V_{gluconeo} = V_{max\_gluconeo} \times \frac{1}{1 + \frac{glucose}{ref_{glucose}}} \times AA\_gluco_{weights}$$

-----

### 7.5 Non-Essential Amino Acid Synthesis

Reactions use glucose as carbon source. Nitrogen balance constraint: N incorporated ≤ N lost during timestep. Stoichiometries based on Olsen (1989).

Special conversions:

- Methionine → Cysteine
- Phenylalanine → Tyrosine

-----

## 8. Carbon Metabolism

### 8.1 Glucose Oxidation

#### Maximum Glucose Oxidation

**Equation (A.43)**
$$V_{max\_glucox} = \min\left( a_{glucox} \times bw \times e^{b \times temperature}, \quad \frac{glucose}{timestep} \right)$$

-----

### 8.2 Glycogenesis and Glycogenolysis

#### Maximum Glycogen Turnover Rate

**Equation (A.44)**
$$V_{max\_glycogen} = constant \times protein_{total}$$

-----

### 8.3 Lipogenesis

#### Maximum Lipogenesis Rate

**Equation (A.45)**
$$V_{max\_lipogen} = \min\left( a_{lipogen} \times bw \times e^{b \times temperature}, \quad \frac{glucose}{timestep} \right)$$

-----

### 8.4 Beta-Oxidation

#### Fatty Acid Beta-Oxidation

**Equation (A.46)**
$$TAG_{betox} = TAG\_ox_{weights} \times m_{ox\_FA}$$

-----

## 9. Performance Indicators

### Relative Growth Rate (RGR)

$$RGR = \left( e^{\frac{\ln(ABW_{i+n}) - \ln(ABW_i)}{day_{i+n} - day_i}} - 1 \right) \times 100$$

**Where:**

- $ABW$ = average body weight (g)
- $RGR$ = relative growth rate (%/day)

-----

## 10. Calibration Data Ranges

|Attribute                 |Unit    |Gilthead Seabream|European Seabass|Atlantic Salmon|Rainbow Trout|Nile Tilapia|
|--------------------------|--------|-----------------|----------------|---------------|-------------|------------|
|Nr. of data sources       |-       |19               |37              |61             |33           |44          |
|Nr. of observational units|-       |118              |126             |398            |110          |186         |
|Nr. of diets              |-       |30               |66              |350            |58           |175         |
|Body weight range         |g       |1–478            |5–482           |1–6645         |2–2080       |1–559       |
|Temperature range         |°C      |11–28            |18–26           |4–20           |4–19         |18–30       |
|**Diet composition:**     |        |                 |                |               |             |            |
|Crude protein             |% as fed|37–58            |37–56           |29–54          |26–58        |23–46       |
|Crude lipids              |% as fed|9–23             |10–31           |10–47          |6–31         |3–15        |
|Gross energy              |MJ/kg   |19–23            |18–25           |18–29          |17–26        |13–21       |
|DP/DE                     |g/MJ    |21–26            |19–30           |12–26          |11–28        |14–26       |

-----

## Key Model Constants and Parameters

### General Parameters

|Symbol |Description                        |Unit         |Notes         |
|-------|-----------------------------------|-------------|--------------|
|$BW$   |Fish body weight                   |g            |State variable|
|$T$    |Water temperature                  |°C           |Input         |
|$FI$   |Feed intake                        |g/day        |Calculated    |
|$ADC$  |Apparent digestibility coefficient |% or fraction|Input         |
|$\beta$|Shape parameter (various equations)|-            |Calibrated    |

### Energy Parameters

|Symbol             |Description                        |Unit            |Notes            |
|-------------------|-----------------------------------|----------------|-----------------|
|$ATP_{stoich\_AA}$|ATP yield from amino acid oxidation|mol ATP/g       |Profile-dependent|
|$ATP_{stoich\_FA}$|ATP yield from fatty acid oxidation|mol ATP/g       |Profile-dependent|
|Max ATP expenditure|Upper physiological limit          |600 µmol·g⁻¹·h⁻¹|Fixed            |

### Time Resolution

|Parameter         |Value                    |
|------------------|-------------------------|
|Model timestep    |0.01 days (~14.4 minutes)|
|Integration method|Forward Euler            |
|Software          |Powersim Studio 10 Expert|

-----

## Model Compartments

```
┌─────────────────────────────────────────────────────────────────┐
│                         FARM MODEL                               │
│  (Population management, feeding regime, economic indicators)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FISH MODEL                               │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────────┐  │
│  │   GUT    │───▶│  BLOOD   │───▶│         BODY             │  │
│  │          │    │          │◀───│ (liver, muscle, brain,   │  │
│  │ Digestion│    │ Transport│    │  adipose tissue, bone)   │  │
│  │Absorption│    │Regulation│    │                          │  │
│  └──────────┘    └──────────┘    │ • Protein synthesis      │  │
│                                  │ • Protein degradation    │  │
│                                  │ • AA oxidation           │  │
│                                  │ • Gluconeogenesis        │  │
│                                  │ • Lipogenesis            │  │
│                                  │ • Beta-oxidation         │  │
│                                  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

-----

## Species Calibrated

|Species          |Scientific Name        |MAPE (Validation)|
|-----------------|-----------------------|-----------------|
|Gilthead seabream|*Sparus aurata*        |12.6%            |
|European seabass |*Dicentrarchus labrax* |11.7%            |
|Atlantic salmon  |*Salmo salar*          |11.7%            |
|Rainbow trout    |*Oncorhynchus mykiss*  |13.8%            |
|Nile tilapia     |*Oreochromis niloticus*|12.9%            |

-----

## License & Citation

This document summarizes the mathematical formulations from:

```bibtex
@article{soares2023feednetics,
  title={Development and Application of a Mechanistic Nutrient-Based Model for Precision Fish Farming},
  author={Soares, Filipe M.R.C. and Nobre, Ana M.D. and Raposo, Andreia I.G. and
          Mendes, Rodrigo C.P. and Engrola, Sofia A.D. and Rema, Paulo J.A.P. and
          Conceição, Luís E.C. and Silva, Tomé S.},
  journal={Journal of Marine Science and Engineering},
  volume={11},
  number={3},
  pages={472},
  year={2023},
  publisher={MDPI},
  doi={10.3390/jmse11030472}
}
```

**Original Article:** Open Access (CC BY 4.0)
**Contact:** luisconceicao@sparos.pt
