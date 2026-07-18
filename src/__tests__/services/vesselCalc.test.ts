/**
 * Tests for vesselCalc.ts — BMI, BMR, TDEE, target calories
 */

import {
  calcBmi,
  bmiCategory,
  calcBmr,
  calcTdee,
  targetCalories,
  calcLbm,
  idealBodyWeight,
  estimateBodyFat,
  recommendedVolume,
  estimateSetCalories,
} from "../../services/vesselCalc";

// ─── BMI ──────────────────────────────────────────────────────────────────────

describe("calcBmi", () => {
  it("calculates BMI correctly", () => {
    // 70kg / (1.70m)^2 = 24.22
    expect(calcBmi(70, 170)).toBe(24.2);
  });

  it("rounds to 1 decimal place", () => {
    const bmi = calcBmi(80, 175);
    expect(bmi).toBeCloseTo(26.1, 1);
  });

  it("handles very light weight", () => {
    expect(calcBmi(40, 160)).toBe(15.6);
  });

  it("handles very heavy weight", () => {
    expect(calcBmi(120, 180)).toBe(37);
  });
});

describe("bmiCategory", () => {
  it("returns underweight for BMI < 18.5", () => {
    expect(bmiCategory(18.4)).toBe("underweight");
    expect(bmiCategory(15)).toBe("underweight");
  });

  it("returns normal for BMI 18.5-24.9", () => {
    expect(bmiCategory(18.5)).toBe("normal");
    expect(bmiCategory(22)).toBe("normal");
    expect(bmiCategory(24.9)).toBe("normal");
  });

  it("returns overweight for BMI 25-29.9", () => {
    expect(bmiCategory(25)).toBe("overweight");
    expect(bmiCategory(29.9)).toBe("overweight");
  });

  it("returns obese for BMI >= 30", () => {
    expect(bmiCategory(30)).toBe("obese");
    expect(bmiCategory(40)).toBe("obese");
  });
});

// ─── BMR ──────────────────────────────────────────────────────────────────────

describe("calcBmr", () => {
  it("calculates BMR for male correctly", () => {
    // Mifflin-St Jeor: 10*70 + 6.25*170 - 5*25 + 5 = 700 + 1062.5 - 125 + 5 = 1642.5
    expect(calcBmr({ weight: 70, height: 170, age: 25, sex: "male" })).toBe(1643);
  });

  it("calculates BMR for female correctly", () => {
    // Mifflin-St Jeor: 10*60 + 6.25*160 - 5*30 - 161 = 600 + 1000 - 150 - 161 = 1289
    expect(calcBmr({ weight: 60, height: 160, age: 30, sex: "female" })).toBe(1289);
  });

  it("male BMR is higher than female with same stats", () => {
    const male = calcBmr({ weight: 70, height: 170, age: 25, sex: "male" });
    const female = calcBmr({ weight: 70, height: 170, age: 25, sex: "female" });
    expect(male).toBeGreaterThan(female);
  });

  it("BMR decreases with age", () => {
    const young = calcBmr({ weight: 70, height: 170, age: 20, sex: "male" });
    const old = calcBmr({ weight: 70, height: 170, age: 60, sex: "male" });
    expect(young).toBeGreaterThan(old);
  });
});

// ─── TDEE ─────────────────────────────────────────────────────────────────────

describe("calcTdee", () => {
  it("uses 1.2 multiplier for sedentary (0-1 days)", () => {
    expect(calcTdee(1500, 0)).toBe(1800);
    expect(calcTdee(1500, 1)).toBe(1800);
  });

  it("uses 1.375 multiplier for light activity (2-3 days)", () => {
    expect(calcTdee(1500, 2)).toBe(2063);
    expect(calcTdee(1500, 3)).toBe(2063);
  });

  it("uses 1.55 multiplier for moderate activity (4-5 days)", () => {
    expect(calcTdee(1500, 4)).toBe(2325);
    expect(calcTdee(1500, 5)).toBe(2325);
  });

  it("uses 1.725 multiplier for very active (6+ days)", () => {
    expect(calcTdee(1500, 6)).toBe(2588);
    expect(calcTdee(1500, 7)).toBe(2588);
  });
});

// ─── Target Calories ──────────────────────────────────────────────────────────

describe("targetCalories", () => {
  it("returns TDEE for maintenance", () => {
    expect(targetCalories(2000, "maintenance")).toBe(2000);
  });

  it("returns 80% TDEE for fat loss", () => {
    expect(targetCalories(2000, "fat_loss")).toBe(1600);
  });

  it("returns 110% TDEE for muscle gain", () => {
    expect(targetCalories(2000, "muscle_gain")).toBe(2200);
  });

  it("returns 105% TDEE for endurance", () => {
    expect(targetCalories(2000, "endurance")).toBe(2100);
  });
});

// ─── LBM ──────────────────────────────────────────────────────────────────────

describe("calcLbm", () => {
  it("calculates lean body mass for male", () => {
    const lbm = calcLbm({ weight: 80, height: 180, sex: "male" });
    expect(lbm).toBeGreaterThan(60);
    expect(lbm).toBeLessThan(80);
  });

  it("calculates lean body mass for female", () => {
    const lbm = calcLbm({ weight: 60, height: 165, sex: "female" });
    expect(lbm).toBeGreaterThan(40);
    expect(lbm).toBeLessThan(60);
  });
});

// ─── Ideal Body Weight ────────────────────────────────────────────────────────

describe("idealBodyWeight", () => {
  it("returns a reasonable IBW for average height male", () => {
    const ibw = idealBodyWeight(175, "male");
    expect(ibw).toBeGreaterThan(60);
    expect(ibw).toBeLessThan(80);
  });

  it("returns a reasonable IBW for average height female", () => {
    const ibw = idealBodyWeight(165, "female");
    expect(ibw).toBeGreaterThan(50);
    expect(ibw).toBeLessThan(70);
  });

  it("IBW increases with height", () => {
    const short = idealBodyWeight(160, "male");
    const tall = idealBodyWeight(185, "male");
    expect(tall).toBeGreaterThan(short);
  });
});

// ─── Body Fat Estimate ────────────────────────────────────────────────────────

describe("estimateBodyFat", () => {
  it("returns a percentage between 5 and 50", () => {
    const bf = estimateBodyFat(22, 25, "male");
    expect(bf).toBeGreaterThanOrEqual(5);
    expect(bf).toBeLessThanOrEqual(50);
  });

  it("higher BMI results in higher body fat estimate", () => {
    const lean = estimateBodyFat(20, 25, "male");
    const heavy = estimateBodyFat(30, 25, "male");
    expect(heavy).toBeGreaterThan(lean);
  });
});

// ─── Recommended Volume ───────────────────────────────────────────────────────

describe("recommendedVolume", () => {
  it("returns volume recommendations for muscle_gain", () => {
    const vol = recommendedVolume("muscle_gain");
    expect(vol.sets).toBeGreaterThan(0);
    expect(vol.repsMin).toBeGreaterThan(0);
    expect(vol.repsMax).toBeGreaterThanOrEqual(vol.repsMin);
    expect(vol.restSec).toBeGreaterThan(0);
  });

  it("returns volume recommendations for fat_loss", () => {
    const vol = recommendedVolume("fat_loss");
    expect(vol.sets).toBeGreaterThan(0);
    expect(vol.repsMin).toBeGreaterThan(0);
  });

  it("fat loss has higher reps than muscle gain", () => {
    const muscle = recommendedVolume("muscle_gain");
    const fat = recommendedVolume("fat_loss");
    expect(fat.repsMin).toBeGreaterThanOrEqual(muscle.repsMin);
  });
});

// ─── Estimate Set Calories ────────────────────────────────────────────────────

describe("estimateSetCalories", () => {
  it("returns positive calories burned", () => {
    const kcal = estimateSetCalories(["chest"], 80, 3);
    expect(kcal).toBeGreaterThan(0);
  });

  it("heavier person burns more calories", () => {
    const light = estimateSetCalories(["chest"], 60, 3);
    const heavy = estimateSetCalories(["chest"], 100, 3);
    expect(heavy).toBeGreaterThan(light);
  });

  it("more sets burns more calories", () => {
    const few = estimateSetCalories(["chest"], 70, 2);
    const many = estimateSetCalories(["chest"], 70, 5);
    expect(many).toBeGreaterThan(few);
  });

  it("cardio body parts have higher MET than forearms", () => {
    const cardio = estimateSetCalories(["cardio"], 70, 3);
    const forearms = estimateSetCalories(["forearms"], 70, 3);
    expect(cardio).toBeGreaterThan(forearms);
  });
});
