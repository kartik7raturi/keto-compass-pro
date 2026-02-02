
# Implementation Plan: Recipe Media, Weekly Planner RLS, Community Chat, and Tracker Redesign

## Status: ✅ COMPLETED

---

## 1. People Recipes - Image and Video Upload ✅

**Completed:**
- Added `video_url` column to `user_recipes` table
- Created `recipe-media` storage bucket with proper RLS policies
- Updated `UserRecipeSubmission.tsx` with image and video upload fields
- Files are uploaded to Supabase Storage before recipe submission

---

## 2. Weekly Planner RLS Fix ✅

**Completed:**
- Added `user_id` column to `meals` table
- Created RLS policies for INSERT, UPDATE, DELETE operations
- Updated `WeeklyPlan.tsx` to include `user_id` when inserting meals
- Updated `CustomPlan.tsx` to include `user_id` when generating meal plans

---

## 3. Community Chat - Direct Chat on Click ✅

**Completed:**
- Removed Members section from sidebar (lines 696-748)
- Removed Members section from community header card (lines 733-787)
- Following section already opens chat directly on click
- Sidebar now shows only: Community icons + Followed Users

---

## 4. Tracker Redesign - MyFitnessPal-Style Daily Diary ✅

**Completed:**
- Created new tracker components:
  - `CalorieRing.tsx` - Circular progress for calorie budget
  - `MealSection.tsx` - Breakfast/Lunch/Dinner/Snacks sections
  - `MacroSummary.tsx` - Macro progress bars
  - `DateNavigator.tsx` - Date navigation with prev/next
  - `AddFoodSheet.tsx` - Bottom sheet for adding food
- Redesigned `Tracker.tsx` with diary-centric layout
- Features include:
  - Date navigation
  - Calorie remaining ring
  - Meal categories with quick add
  - Ketosis status indicator
  - Quick access to other trackers

---

## Files Modified

| File | Status |
|------|--------|
| `src/components/UserRecipeSubmission.tsx` | ✅ Updated with image/video upload |
| `src/pages/WeeklyPlan.tsx` | ✅ Added user_id to meal inserts |
| `src/pages/CustomPlan.tsx` | ✅ Added user_id to meal inserts |
| `src/components/Community.tsx` | ✅ Removed members sections |
| `src/pages/Tracker.tsx` | ✅ Redesigned with diary layout |
| `src/components/tracker/CalorieRing.tsx` | ✅ New component |
| `src/components/tracker/MealSection.tsx` | ✅ New component |
| `src/components/tracker/MacroSummary.tsx` | ✅ New component |
| `src/components/tracker/DateNavigator.tsx` | ✅ New component |
| `src/components/tracker/AddFoodSheet.tsx` | ✅ New component |
