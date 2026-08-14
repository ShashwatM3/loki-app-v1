export type BudgetLevel = "Low" | "Moderate" | "High";

export const BUDGET_BANDS: Record<BudgetLevel, { min: number; max: number | null }> = {
  Low: { min: 0, max: 100 },
  Moderate: { min: 100, max: 300 },
  High: { min: 300, max: null },
};

type PricedPlace = {
  budget?: string;
  priceMin?: number;
  priceMax?: number;
};

export function normalizeBudgetLevel(value?: string): BudgetLevel | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (["low", "cheap", "budget", "$"].some((t) => v.includes(t))) return "Low";
  if (["moderate", "mid", "medium", "$$"].some((t) => v.includes(t))) return "Moderate";
  if (["high", "expensive", "luxury", "premium", "splurge", "$$$"].some((t) => v.includes(t))) {
    return "High";
  }
  return null;
}

function range(place: PricedPlace): { min: number | null; max: number | null } {
  const min = typeof place.priceMin === "number" && Number.isFinite(place.priceMin) ? place.priceMin : null;
  const max = typeof place.priceMax === "number" && Number.isFinite(place.priceMax) ? place.priceMax : null;
  return { min, max };
}

export function placeUnderPrice(place: PricedPlace, maxAed: number): boolean {
  const { min } = range(place);
  if (min !== null) return min <= maxAed;
  const level = normalizeBudgetLevel(place.budget);
  if (!level) return false;
  return BUDGET_BANDS[level].min <= maxAed;
}

export function placeMatchesBudgetLevel(place: PricedPlace, level: BudgetLevel): boolean {
  const { min, max } = range(place);
  if (min !== null || max !== null) {
    const band = BUDGET_BANDS[level];
    const low = min ?? 0;
    const high = max ?? min ?? Number.POSITIVE_INFINITY;
    const bandHigh = band.max ?? Number.POSITIVE_INFINITY;
    return low < bandHigh && high >= band.min;
  }
  return normalizeBudgetLevel(place.budget) === level;
}