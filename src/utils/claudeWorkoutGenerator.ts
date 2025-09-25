import { Exercise, Workout } from '@/types/exercise';

interface EnhancedWorkoutPreferences {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  focusArea: string;
  notes: string;
}

interface ClaudeWorkoutResponse {
  exercises: Exercise[];
  totalDuration: number;
  estimatedCalories: number;
}

export class ClaudeWorkoutGenerator {
  static async generateWorkout(preferences: EnhancedWorkoutPreferences): Promise<Workout> {
    try {
      const response = await fetch('/functions/v1/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ClaudeWorkoutResponse = await response.json();
      
      return {
        id: Date.now().toString(),
        exercises: data.exercises,
        totalDuration: data.totalDuration,
        estimatedCalories: data.estimatedCalories,
        preferences: {
          timeMinutes: preferences.duration <= 5 ? 5 : preferences.duration <= 10 ? 3 : 2,
          spaceType: preferences.spaceSize === 'small' ? 'tight' : 'normal',
          energyLevel: preferences.intensity === 'light' ? 'low' : preferences.intensity === 'intense' ? 'high' : 'medium',
          equipment: preferences.hasWeights ? 'chair' : 'none'
        }
      };
    } catch (error) {
      console.error('Failed to generate workout with Claude:', error);
      
      // Fallback workout if Claude fails
      return this.getFallbackWorkout(preferences);
    }
  }

  private static getFallbackWorkout(preferences: EnhancedWorkoutPreferences): Workout {
    const fallbackExercises: Exercise[] = [
      {
        id: 'warmup-1',
        name: 'Arm Circles',
        duration: 30,
        instructions: 'Stand with feet shoulder-width apart. Extend arms to sides and make small circles, gradually increasing size.',
        formTips: ['Keep shoulders relaxed', 'Start small and increase circle size', 'Maintain steady breathing'],
        category: 'warmup',
        restAfter: 10
      },
      {
        id: 'main-1',
        name: 'Bodyweight Squats',
        duration: 45,
        reps: 15,
        instructions: 'Stand with feet hip-width apart. Lower body by bending knees and pushing hips back.',
        formTips: ['Keep chest up', 'Weight on heels', 'Knees track over toes', 'Go down until thighs parallel'],
        category: 'main',
        restAfter: 20
      },
      {
        id: 'cooldown-1',
        name: 'Forward Fold Stretch',
        duration: 30,
        instructions: 'Stand tall and slowly fold forward, letting arms hang naturally.',
        formTips: ['Bend from hips', 'Keep knees soft', 'Breathe deeply', 'Hold gentle stretch'],
        category: 'cooldown',
        restAfter: 0
      }
    ];

      return {
        id: Date.now().toString(),
        exercises: fallbackExercises,
        totalDuration: preferences.duration * 60,
        estimatedCalories: Math.round(preferences.duration * 5),
        preferences: {
          timeMinutes: preferences.duration <= 5 ? 5 : preferences.duration <= 10 ? 3 : 2,
          spaceType: preferences.spaceSize === 'small' ? 'tight' : 'normal',
          energyLevel: preferences.intensity === 'light' ? 'low' : preferences.intensity === 'intense' ? 'high' : 'medium',
          equipment: preferences.hasWeights ? 'chair' : 'none'
        }
      };
  }
}