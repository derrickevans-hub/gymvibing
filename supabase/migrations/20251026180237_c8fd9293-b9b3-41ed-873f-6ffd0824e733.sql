-- Create exercises table to store workout library
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  difficulty integer CHECK (difficulty >= 1 AND difficulty <= 3),
  body_part text NOT NULL, -- upper, lower, core, cardio, flexibility, full-body
  equipment text NOT NULL, -- none, chair, wall, weights, resistance-bands, etc.
  duration integer DEFAULT 30, -- in seconds
  reps integer,
  sets integer,
  space_requirement text DEFAULT 'normal', -- minimal, normal, large
  energy_level text DEFAULT 'medium', -- low, medium, high
  instructions text,
  form_tips jsonb, -- array of tips
  category text DEFAULT 'main', -- warmup, main, cooldown
  rest_after integer DEFAULT 0, -- rest time in seconds
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_exercises_body_part ON public.exercises(body_part);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX idx_exercises_category ON public.exercises(category);

-- Enable RLS (public read access for all users)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read exercises
CREATE POLICY "Anyone can view exercises"
  ON public.exercises
  FOR SELECT
  USING (true);

-- Only authenticated admins can modify (for future admin panel)
CREATE POLICY "Only authenticated users can insert exercises"
  ON public.exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update exercises"
  ON public.exercises
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can delete exercises"
  ON public.exercises
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();