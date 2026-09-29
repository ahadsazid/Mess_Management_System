-- ============================================================
-- Personalized Meal Recommendation - NEW feature only
-- Existing tables are not modified.
-- ============================================================

CREATE TABLE IF NOT EXISTS meal_recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  meal_time text NOT NULL CHECK (meal_time IN ('day', 'night')),
  action text NOT NULL CHECK (action IN ('accepted', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, meal_id, meal_time)
);

CREATE INDEX IF NOT EXISTS idx_meal_recommendation_feedback_member
  ON meal_recommendation_feedback(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meal_recommendation_feedback_meal
  ON meal_recommendation_feedback(meal_id, meal_time);

ALTER TABLE meal_recommendation_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view own recommendation feedback"
  ON meal_recommendation_feedback;

CREATE POLICY "Members can view own recommendation feedback"
ON meal_recommendation_feedback
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM members m
    WHERE m.id = meal_recommendation_feedback.member_id
      AND m.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can insert own recommendation feedback"
  ON meal_recommendation_feedback;

CREATE POLICY "Members can insert own recommendation feedback"
ON meal_recommendation_feedback
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM members m
    WHERE m.id = meal_recommendation_feedback.member_id
      AND m.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can update own recommendation feedback"
  ON meal_recommendation_feedback;

CREATE POLICY "Members can update own recommendation feedback"
ON meal_recommendation_feedback
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM members m
    WHERE m.id = meal_recommendation_feedback.member_id
      AND m.auth_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM members m
    WHERE m.id = meal_recommendation_feedback.member_id
      AND m.auth_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can delete own recommendation feedback"
  ON meal_recommendation_feedback;

CREATE POLICY "Members can delete own recommendation feedback"
ON meal_recommendation_feedback
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM members m
    WHERE m.id = meal_recommendation_feedback.member_id
      AND m.auth_id = auth.uid()
  )
);
