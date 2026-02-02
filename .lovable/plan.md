
# Implementation Plan: Recipe Media, Weekly Planner RLS, Community Chat, and Tracker Redesign

## Overview
This plan addresses four requests:
1. Allow image and video uploads for People Recipes
2. Fix the Weekly Planner "Add to Plan" RLS error with secure ownership
3. Show chat directly when clicking on followed users (remove member profiles from sidebar)
4. Redesign the Tracker with a MyFitnessPal-style daily diary

---

## 1. People Recipes - Image and Video Upload

### Problem
Currently, users can submit recipes in the People Recipes section but cannot add main images or recipe videos. The `user_recipes` table has an `image_url` column but no `video_url` column.

### Solution

**Database Changes:**
- Add a `video_url` column to the `user_recipes` table

**Storage Changes:**
- Create a new storage bucket `recipe-media` for user recipe images and videos
- Add RLS policies allowing authenticated users to upload to their own folder

**Frontend Changes:**
- Update `UserRecipeSubmission.tsx` to include:
  - Image file picker with preview
  - Video file picker with validation (max 50MB, common video formats)
  - Upload to Supabase Storage before submitting the recipe
  - Store the public URLs in `image_url` and `video_url` columns

---

## 2. Weekly Planner RLS Fix (Secure Approach)

### Problem
When clicking "Add to Plan" in the Weekly Planner, users see: "new row violates row-level security policy". The `meals` table currently has no INSERT/UPDATE/DELETE policies.

### Root Cause
The `meals` table allows anyone to SELECT but has no policies for INSERT, UPDATE, or DELETE. When creating a meal during the "Add to Plan" flow, the insert fails.

### Solution

**Database Changes:**
- Add a `user_id` column to the `meals` table (nullable to preserve existing data)
- Create RLS policies:
  - INSERT: Authenticated users can insert meals with their own `user_id`
  - UPDATE: Users can update their own meals (where `user_id = auth.uid()`)
  - DELETE: Users can delete their own meals
  - Keep SELECT policy allowing anyone to view meals

**Frontend Changes:**
- Update `WeeklyPlan.tsx` and `CustomPlan.tsx` to include `user_id` when inserting meals
- This ensures meals are properly owned and RLS passes

---

## 3. Community Chat - Direct Chat on Click, Remove Member List

### Problem
- Clicking on followed users in the sidebar opens profile dialogs instead of directly opening the chat
- The Members section clutters the sidebar

### Current Behavior
- Followed users (`followedUsers`) correctly call `startDirectMessage(userId)` which opens chat
- Community members call `setViewingUser(member.user_id)` which opens a profile dialog
- Users must then click a DM button from the profile to start messaging

### Solution

**Frontend Changes in `Community.tsx`:**
- Remove the Members section entirely from the sidebar (lines 696-748)
- Keep only Community icons and Following users
- The Following section already opens chat directly on click - this is working correctly
- Remove the member avatars to declutter the interface

**Result:**
- Sidebar shows only: Community icons + Followed Users (for quick chat)
- Clicking any followed user immediately opens the chat panel
- No more profile dialogs blocking the messaging flow

---

## 4. Tracker Redesign - MyFitnessPal-Style Daily Diary

### Problem
The current tracker looks basic compared to apps like MyFitnessPal. Users want a more professional food diary experience.

### Solution

**New Features:**
1. **Daily Diary View** - Replace grid of tracker cards with a diary-focused layout
2. **Meal Categories** - Breakfast, Lunch, Dinner, Snacks sections
3. **Calories Remaining** - Prominent display of remaining calories for the day
4. **Quick Add** - Easy access to add foods to any meal
5. **Date Navigation** - Navigate between days to view/log past meals

**Frontend Changes:**

**Update `Tracker.tsx`:**
- Redesign layout to be diary-centric
- Add date picker/navigation at the top
- Show calorie goal and remaining prominently
- Group meals by category (Breakfast/Lunch/Dinner/Snacks)

**Update `EnhancedMacroTracker.tsx`:**
- Add meal category selection when adding food
- Improve the recent meals display with meal categories
- Add calorie budget display with visual progress

**New UI Elements:**
- Circular progress for calorie budget
- Meal category sections with + Add buttons
- Running totals per meal category
- Daily summary card

---

## Technical Details

### Database Migration SQL

```sql
-- 1. Add video_url to user_recipes
ALTER TABLE public.user_recipes 
ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Create recipe-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-media', 'recipe-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies for recipe-media
CREATE POLICY "Public read for recipe media"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-media');

CREATE POLICY "Users can upload recipe media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update recipe media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete recipe media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recipe-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Add user_id to meals table for RLS
ALTER TABLE public.meals 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 5. RLS policies for meals table
CREATE POLICY "Authenticated users can insert meals"
ON public.meals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
ON public.meals FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
ON public.meals FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/UserRecipeSubmission.tsx` | Add image/video upload fields with storage integration |
| `src/pages/WeeklyPlan.tsx` | Include `user_id` in meal insert operations |
| `src/pages/CustomPlan.tsx` | Include `user_id` in meal insert operations |
| `src/components/Community.tsx` | Remove members section from sidebar (keep only communities + following) |
| `src/pages/Tracker.tsx` | Redesign with MyFitnessPal-style diary layout |
| `src/components/EnhancedMacroTracker.tsx` | Add meal categories, calorie budget display |

### Estimated Changes
- 1 database migration
- 1 new storage bucket with policies
- 6 files modified

---

## Mobile Responsiveness Notes

The tracker redesign will prioritize mobile-first design:
- Single column layout on mobile
- Bottom sheet for adding food
- Swipeable date navigation
- Touch-friendly meal category buttons

---

## Summary

After implementation:
1. Users can upload images and videos when submitting recipes in People Recipes
2. Weekly Planner "Add to Plan" works without RLS errors (meals are owned by users)
3. Community sidebar shows only communities and followed users; clicking any followed user opens chat directly
4. Tracker has a professional MyFitnessPal-style diary with meal categories, calorie budget, and quick add
