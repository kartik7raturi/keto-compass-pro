import { supabase } from '@/integrations/supabase/client';

export type DietPreference = 'vegan' | 'vegetarian' | 'non_vegetarian';

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
 */
export const fetchRecipePoolForDiet = async (dietPreference: DietPreference) => {
  const allowedCategories =
    dietPreference === 'vegan'
      ? ['vegan']
      : dietPreference === 'vegetarian'
      ? ['vegan', 'vegetarian']
      : ['vegan', 'vegetarian', 'non_vegetarian'];

  const { data, error } = await supabase
    .from('recipes')
    .select('id, title, calories, carbs, protein, fat, category, diet_category')
    .in('diet_category', allowedCategories);

  if (error || !data) return [];
  return data;
};

/**
 * Builds a 7-day breakfast/lunch/dinner plan from a recipe pool, respecting
 * the user's diet preference. Uses a deterministic seed (based on the user's
 * id or email) so the same person sees a consistent plan rather than a new
 * random one on every visit, while still varying meaningfully between users.
 */
export const generateWeeklyPlan = async (
  dietPreference: DietPreference,
  seed = 0
): Promise<DayPlan[]> => {
  const pool = await fetchRecipePoolForDiet(dietPreference);
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
