export const TEST_PARAMETERS = {
  BLOOD_TEST: [
    { name: "Hemoglobin (Hb)", unit: "g/dL", low: 12, high: 16 },
    { name: "RBC Count", unit: "million/µL", low: 4.0, high: 5.2 },
    { name: "WBC Count", unit: "cells/µL", low: 4000, high: 11000 },
    { name: "Platelets", unit: "/µL", low: 150000, high: 450000 },
    { name: "Hematocrit (PCV)", unit: "%", low: 36, high: 46 },
    { name: "MCV", unit: "fL", low: 80, high: 100 },
    { name: "MCH", unit: "pg", low: 27, high: 34 },
    { name: "MCHC", unit: "g/dL", low: 32, high: 36 }
  ],

  URINE_TEST: [
    { name: "pH", unit: "", low: 4, high: 8 },
    { name: "Protein", unit: "mg/dL", low: 0, high: 20 },
    { name: "Glucose", unit: "mg/dL", low: 0, high: 15 },
    { name: "Specific Gravity", unit: "", low: 1.005, high: 1.030 }
  ],

  LIVER_FUNCTION_TEST: [
    { name: "Bilirubin Total", unit: "mg/dL", low: 0.3, high: 1.2 },
    { name: "SGOT (AST)", unit: "U/L", low: 5, high: 40 },
    { name: "SGPT (ALT)", unit: "U/L", low: 7, high: 56 },
    { name: "Alkaline Phosphatase", unit: "U/L", low: 44, high: 147 }
  ],

  KIDNEY_FUNCTION_TEST: [
    { name: "Creatinine", unit: "mg/dL", low: 0.6, high: 1.3 },
    { name: "Blood Urea", unit: "mg/dL", low: 7, high: 20 },
    { name: "Uric Acid", unit: "mg/dL", low: 3.5, high: 7.2 }
  ],

  ECG: [
    { name: "Heart Rate", unit: "bpm", low: 60, high: 100 },
    { name: "PR Interval", unit: "ms", low: 120, high: 200 },
    { name: "QT Interval", unit: "ms", low: 350, high: 440 }
  ],

  XRAY: [
    {
      name: "Radiologist Findings",
      isText: true
    }
  ],

  MRI: [
    {
      name: "Radiologist Findings",
      isText: true
    }
  ]
};
