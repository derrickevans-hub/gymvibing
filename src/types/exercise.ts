export interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  reps?: number;
  difficulty: 1 | 2 | 3;
  spaceRequirement: 'minimal' | 'normal' | 'large';
  energyLevel: 'low' | 'medium' | 'high';
  bodyFocus: 'upper' | 'lower' | 'core' | 'cardio' | 'flexibility';
  equipment: 'none' | 'chair' | 'wall';
  instructions: string;
  animation?: string; // For future stick figure animations
}

export interface WorkoutPreferences {
  timeMinutes: 2 | 3 | 5;
  spaceType: 'tight' | 'normal' | 'outdoor';
  energyLevel: 'low' | 'medium' | 'high';
  equipment: 'none' | 'chair' | 'wall';
}

export interface Workout {
  id: string;
  exercises: Exercise[];
  totalDuration: number;
  estimatedCalories: number;
  preferences: WorkoutPreferences;
}

export type FocusArea = 'upper-body' | 'lower-body' | 'core' | 'full-body' | 'cardio' | 'functional' | 'mobility';

export interface UserStats {
  streak: number;
  totalWorkouts: number;
  totalMinutes: number;
  lastWorkoutDate?: Date;
}