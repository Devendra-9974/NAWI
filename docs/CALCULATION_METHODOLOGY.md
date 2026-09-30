# LegalMetrix: OIML R 76 Calculation & Compliance Methodology

This document specifies the metrological formulas and regulatory rules implemented in the **LegalMetrix** calculation and compliance engines, adhering strictly to **OIML R 76-1:2006 (Non-automatic weighing instruments)**.

---

## 1. Fundamental Metrological Parameters

| Parameter | Symbol | Definition / Significance |
| :--- | :---: | :--- |
| **Verification Scale Interval** | $e$ | Value expressed in units of mass, used for instrument classification and verification. |
| **Actual Scale Interval** | $d$ | Value expressed in units of mass of the difference between two consecutive indicated values. |
| **Maximum Capacity** | $Max$ | Upper limit of the weighing range, not taking into account additive tare capacity. |
| **Minimum Capacity** | $Min$ | Value of the load below which weighing results may be subject to excessive relative error. |
| **Number of Verification Scale Intervals** | $n$ | $n = \frac{Max}{e}$ |

---

## 2. Determination of Error (Clause A.4.4.3)

For instruments where $d > 0.2\,e$, errors are determined with high resolution using **changeover weights** (turning points):

### 2.1 Formula Prior to Rounding:
$$P = I + \frac{1}{2}e - \Delta L$$

$$E = P - L = I + \frac{1}{2}e - \Delta L - L$$

Where:
* $I$ = Indication on instrument display.
* $e$ = Verification scale interval.
* $\Delta L$ = Small weights added incrementally (e.g. $0.1\,e$) until display changes to $I + d$.
* $L$ = Reference standard load applied.

*Note: If changeover weights $\Delta L$ are not applied ($d \le 0.2\,e$), the direct error is evaluated as $E = I - L$.*

### 2.2 Corrected Error ($E_c$):
To eliminate zero-load offset, the corrected error is computed as:
$$E_c = E - E_0$$
Where $E_0$ is the calculated error at zero load (or at $Min$).

---

## 3. Maximum Permissible Errors (mpe) — Table 6

Maximum permissible errors for net load on initial verification or type evaluation:

### Class III (Medium Accuracy):
* **Tier 1**: $0 \le m \le 500\,e \implies \text{mpe} = \pm 0.5\,e$
* **Tier 2**: $500\,e < m \le 2000\,e \implies \text{mpe} = \pm 1.0\,e$
* **Tier 3**: $2000\,e < m \le 10000\,e \implies \text{mpe} = \pm 1.5\,e$

### Class II (High Accuracy):
* **Tier 1**: $0 \le m \le 5000\,e \implies \text{mpe} = \pm 0.5\,e$
* **Tier 2**: $5000\,e < m \le 20000\,e \implies \text{mpe} = \pm 1.0\,e$
* **Tier 3**: $20000\,e < m \le 100000\,e \implies \text{mpe} = \pm 1.5\,e$

### Class I (Special Accuracy):
* **Tier 1**: $0 \le m \le 50000\,e \implies \text{mpe} = \pm 0.5\,e$
* **Tier 2**: $50000\,e < m \le 200000\,e \implies \text{mpe} = \pm 1.0\,e$
* **Tier 3**: $m > 200000\,e \implies \text{mpe} = \pm 1.5\,e$

### Class IIII (Ordinary Accuracy):
* **Tier 1**: $0 \le m \le 50\,e \implies \text{mpe} = \pm 0.5\,e$
* **Tier 2**: $50\,e < m \le 200\,e \implies \text{mpe} = \pm 1.0\,e$
* **Tier 3**: $200\,e < m \le 1000\,e \implies \text{mpe} = \pm 1.5\,e$

---

## 4. Repeatability Evaluation (Clause A.4.10)

The difference between the maximum and minimum indications obtained for the same test load in a series of measurements shall not exceed the absolute value of the maximum permissible error for that load:

$$\Delta I = I_{\max} - I_{\min} \le |\text{mpe}|$$

---

## 5. Eccentric Loading Evaluation (Clause A.4.7)

A test load corresponding to approximately $\frac{1}{3} Max$ is placed on 5 designated platform locations:
1. Center
2. Front-Left (Corner 1)
3. Front-Right (Corner 2)
4. Back-Left (Corner 3)
5. Back-Right (Corner 4)

The error at each position must satisfy:
$$|E_i| \le \text{mpe}$$

---

## 6. Implementation Architecture

1. **High-Precision BigDecimal**: All calculations use `java.math.BigDecimal` with `RoundingMode.HALF_UP` and scale of 6 decimal places to prevent floating-point drift.
2. **Versioned Rules Table**: Tolerances are not hard-coded in Java conditional statements; they are retrieved dynamically based on the active `StandardVersion` foreign key.
3. **Historical Immutability**: Historical evaluations snapshot their evaluated rule version, preserving audit integrity forever.
