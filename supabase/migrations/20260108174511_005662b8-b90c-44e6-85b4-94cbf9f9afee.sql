-- Drop the old check constraint and add a new one with more categories
ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_challenge_type_check;

ALTER TABLE public.challenges ADD CONSTRAINT challenges_challenge_type_check 
CHECK (challenge_type = ANY (ARRAY['keto'::text, 'fasting'::text, 'workout'::text, 'water'::text, 'keto_30_days'::text, 'sugar_free'::text, '10k_steps'::text, 'weight_loss'::text, 'custom'::text]));

-- Update challenges with proper challenge_type categorization
UPDATE public.challenges 
SET challenge_type = 'keto' 
WHERE (title ILIKE '%keto%' OR title ILIKE '%carb%' OR title ILIKE '%sugar%' OR title ILIKE '%macro%')
AND challenge_type NOT IN ('keto', 'fasting', 'workout', 'water');

UPDATE public.challenges 
SET challenge_type = 'fasting' 
WHERE (title ILIKE '%fast%' OR title ILIKE '%intermittent%')
AND challenge_type NOT IN ('keto', 'fasting', 'workout', 'water');

UPDATE public.challenges 
SET challenge_type = 'workout' 
WHERE (title ILIKE '%workout%' OR title ILIKE '%step%' OR title ILIKE '%exercise%' OR title ILIKE '%endurance%' OR title ILIKE '%recovery%' OR title ILIKE '%fuel%')
AND challenge_type NOT IN ('keto', 'fasting', 'workout', 'water');

UPDATE public.challenges 
SET challenge_type = 'water' 
WHERE (title ILIKE '%water%' OR title ILIKE '%hydra%')
AND challenge_type NOT IN ('keto', 'fasting', 'workout', 'water');

-- Set default to 'keto' for any remaining null values
UPDATE public.challenges 
SET challenge_type = 'keto' 
WHERE challenge_type IS NULL OR challenge_type = '';

-- Insert challenge-specific badges if they don't exist
INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT '30-Day Keto Champion', 'Completed a 30-day keto challenge', 'flame', 'keto', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = '30-Day Keto Champion');

INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT 'Fasting Master', 'Completed a fasting challenge', 'timer', 'fasting', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Fasting Master');

INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT 'Fitness Champion', 'Completed a workout challenge', 'dumbbell', 'workout', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Fitness Champion');

INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT 'Hydration Master', 'Completed a water intake challenge', 'droplet', 'water', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Hydration Master');

INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT 'Sugar-Free Warrior', 'Completed a sugar-free challenge', 'leaf', 'keto', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = 'Sugar-Free Warrior');

INSERT INTO public.badges (name, description, icon, badge_type, requirement_type, requirement_value)
SELECT '10K Steps Hero', 'Completed a 10K steps challenge', 'footprints', 'workout', 'challenge_completed', 1
WHERE NOT EXISTS (SELECT 1 FROM public.badges WHERE name = '10K Steps Hero');