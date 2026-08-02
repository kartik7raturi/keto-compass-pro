import { supabase } from '@/integrations/supabase/client';

export type DietPreference = 'vegan' | 'vegetarian' | 'non_vegetarian';
export type BudgetPreference = 'budget' | 'moderate' | 'premium';

export interface PlannedMeal {
  id: string;
  title: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  meal_type: string;
}

export interface DayPlan {
  day: string;
  breakfast?: PlannedMeal;
  lunch?: PlannedMeal;
  dinner?: PlannedMeal;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Fetches recipes matching the user's diet preference. Vegans only get vegan
 * recipes; vegetarians get vegan + vegetarian; non-vegetarians can eat anything
 * (including vegan/vegetarian dishes), so their pool is the widest.
 *
 * Also respects a weekly grocery budget, preferring cheaper recipes first but
 * never returning an empty pool just because of budget — it widens the cost
 * tier automatically if there isn't enough variety at the strictest tier.
 */
export const fetchRecipePoolForDiet = async (
  dietPreference: DietPreference,
  budgetPreference?: BudgetPreference | null
) => {
  const allowedCategories =
    dietPreference === 'vegan'
      ? ['vegan']
      : dietPreference === 'vegetarian'
      ? ['vegan', 'vegetarian']
      : ['vegan', 'vegetarian', 'non_vegetarian'];

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, calories, carbs, protein, fat, category, diet_category, cost_tier')
    .in('diet_category', allowedCategories);

  if (error || !data) return [];

  if (!budgetPreference) return data;

  const allowedCostTiers =
    budgetPreference === 'budget'
      ? ['budget']
      : budgetPreference === 'moderate'
      ? ['budget', 'moderate']
      : ['budget', 'moderate', 'premium'];

  const filtered = data.filter((r) => allowedCostTiers.includes((r as any).cost_tier));
  // Never starve the plan of variety — if the strict budget tier has too few
  // options, fall back to the full diet-matched pool instead.
  return filtered.length >= 6 ? filtered : data;
};

/**
 * Builds a 7-day breakfast/lunch/dinner plan from a recipe pool, respecting
 * the user's diet preference. Uses a deterministic seed (based on the user's
 * id or email) so the same person sees a consistent plan rather than a new
 * random one on every visit, while still varying meaningfully between users.
 */
export const generateWeeklyPlan = async (
  dietPreference: DietPreference,
  seed = 0,
  budgetPreference?: BudgetPreference | null
): Promise<DayPlan[]> => {
  const pool = await fetchRecipePoolForDiet(dietPreference, budgetPreference);
  if (pool.length === 0) return [];

  const byType = (type: string) => {
    const matches = pool.filter((r) => (r.category || '').toLowerCase().includes(type));
    return matches.length > 0 ? matches : pool;
  };

  const breakfasts = byType('breakfast');
  const lunches = byType('lunch');
  const dinners = byType('dinner');

  const pick = (arr: typeof pool, index: number) => arr[(index + seed) % arr.length];

  return DAYS.map((day, i) => ({
    day,
    breakfast: pick(breakfasts, i) as PlannedMeal,
    lunch: pick(lunches, i + 2) as PlannedMeal,
    dinner: pick(dinners, i + 4) as PlannedMeal,
  }));
};

/** Simple deterministic hash so each user gets a stable but distinct plan. */
export const seedFromString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000;
  }
  return hash;
};
