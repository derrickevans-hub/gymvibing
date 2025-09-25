import { Exercise, Workout, WorkoutPreferences } from '@/types/exercise';
import { exerciseDatabase } from '@/data/exercises';

export class WorkoutGenerator {
  static generateWorkout(preferences: WorkoutPreferences): Workout {
    const { timeMinutes, spaceType, energyLevel, equipment } = preferences;
    
    // Calculate target duration in seconds (leave 10-15 seconds buffer)
    const targetDuration = (timeMinutes * 60) - 15;
    
    // Filter exercises based on preferences
    const suitableExercises = this.filterExercises(preferences);
    
    // Select exercises to fit the time constraint
    const selectedExercises = this.selectExercises(suitableExercises, targetDuration);
    
    // Calculate total duration and calories
    const totalDuration = selectedExercises.reduce((sum, ex) => sum + ex.duration, 0);
    const estimatedCalories = Math.round((totalDuration / 60) * this.getCalorieRate(energyLevel));
    
    return {
      id: Date.now().toString(),
      exercises: selectedExercises,
      totalDuration,
      estimatedCalories,
      preferences
    };
  }
  
  private static filterExercises(preferences: WorkoutPreferences): Exercise[] {
    const { spaceType, energyLevel, equipment } = preferences;
    
    return exerciseDatabase.filter(exercise => {
      // Space requirement check
      const spaceMatch = this.matchesSpaceRequirement(exercise, spaceType);
      
      // Energy level check (allow one level up or down for variety)
      const energyMatch = this.matchesEnergyLevel(exercise, energyLevel);
      
      // Equipment check
      const equipmentMatch = exercise.equipment === 'none' || exercise.equipment === equipment;
      
      return spaceMatch && energyMatch && equipmentMatch;
    });
  }
  
  private static matchesSpaceRequirement(exercise: Exercise, spaceType: string): boolean {
    switch (spaceType) {
      case 'tight':
        return exercise.spaceRequirement === 'minimal';
      case 'normal':
        return exercise.spaceRequirement === 'minimal' || exercise.spaceRequirement === 'normal';
      case 'outdoor':
        return true; // All exercises work outdoor
      default:
        return true;
    }
  }
  
  private static matchesEnergyLevel(exercise: Exercise, energyLevel: string): boolean {
    const energyLevels = ['low', 'medium', 'high'];
    const targetIndex = energyLevels.indexOf(energyLevel);
    const exerciseIndex = energyLevels.indexOf(exercise.energyLevel);
    
    // Allow exercises within 1 level of target energy
    return Math.abs(targetIndex - exerciseIndex) <= 1;
  }
  
  private static selectExercises(exercises: Exercise[], targetDuration: number): Exercise[] {
    if (exercises.length === 0) {
      // Fallback to basic exercises if no matches
      return [
        exerciseDatabase.find(ex => ex.id === 'arm-circles')!,
        exerciseDatabase.find(ex => ex.id === 'calf-raises')!,
        exerciseDatabase.find(ex => ex.id === 'neck-rolls')!
      ].filter(Boolean);
    }
    
    const selected: Exercise[] = [];
    let currentDuration = 0;
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);
    
    // Ensure variety in body focus
    const usedBodyFocus = new Set<string>();
    
    for (const exercise of shuffled) {
      if (currentDuration + exercise.duration <= targetDuration) {
        // Prefer exercises with different body focus for variety
        if (!usedBodyFocus.has(exercise.bodyFocus) || selected.length < 3) {
          selected.push(exercise);
          currentDuration += exercise.duration;
          usedBodyFocus.add(exercise.bodyFocus);
          
          // Aim for 3-4 exercises
          if (selected.length >= 4) break;
        }
      }
    }
    
    // Ensure minimum of 2 exercises
    if (selected.length < 2 && shuffled.length >= 2) {
      selected.length = 0;
      currentDuration = 0;
      
      // Just take the first few that fit
      for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        if (currentDuration + shuffled[i].duration <= targetDuration) {
          selected.push(shuffled[i]);
          currentDuration += shuffled[i].duration;
        }
      }
    }
    
    return selected;
  }
  
  private static getCalorieRate(energyLevel: string): number {
    // Calories per minute estimate based on energy level
    switch (energyLevel) {
      case 'low': return 3;
      case 'medium': return 5;
      case 'high': return 8;
      default: return 4;
    }
  }
}