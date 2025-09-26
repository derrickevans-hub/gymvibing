import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button-minimal';
import { 
  ArrowLeft,
  Play,
  Clock,
  Target,
  Zap,
  Bookmark,
  Loader2
} from 'lucide-react';
import { Workout } from '@/types/exercise';
import { supabase } from '@/integrations/supabase/client';

interface WorkoutPlanState {
  workout: Workout;
  preferences: {
    spaceSize: 'small' | 'big';
    hasWeights: boolean;
    intensity: 'light' | 'moderate' | 'intense';
    duration: number;
    focusArea: string;
    notes: string;
  };
}

const WorkoutPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const state = location.state as WorkoutPlanState;
  
  if (!state?.workout) {
    // Redirect back to home if no workout data
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const { workout, preferences } = state;

  const generateNewWorkout = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          spaceSize: preferences.spaceSize,
          hasWeights: preferences.hasWeights,
          intensity: preferences.intensity,
          duration: preferences.duration,
          focusArea: preferences.focusArea,
          notes: preferences.notes
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to generate workout');
      }

      // Create new workout object
      const newWorkout: Workout = {
        id: `workout-${Date.now()}`,
        exercises: data.exercises.map((exercise: any, index: number) => ({
          id: exercise.id || `exercise-${index + 1}`,
          name: exercise.name,
          duration: exercise.duration,
          reps: exercise.reps,
          sets: exercise.sets,
          instructions: exercise.instructions,
          formTips: exercise.formTips || ['Maintain proper form', 'Control the movement', 'Focus on quality over quantity'],
          category: exercise.category || 'main',
          restAfter: exercise.restAfter || 30
        })),
        totalDuration: data.totalDuration,
        estimatedCalories: data.estimatedCalories || Math.round(preferences.duration * 8),
        preferences: {
          timeMinutes: preferences.duration as 2 | 3 | 5,
          spaceType: preferences.spaceSize === 'small' ? 'tight' : 'normal',
          energyLevel: preferences.intensity === 'light' ? 'low' : preferences.intensity === 'moderate' ? 'medium' : 'high',
          equipment: preferences.hasWeights ? 'chair' : 'none'
        }
      };

      // Navigate to new workout page with updated data
      navigate('/workout-plan', { 
        state: { workout: newWorkout, preferences },
        replace: true 
      });
    } catch (error) {
      console.error('Failed to generate workout:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkout = () => {
    navigate('/workout-timer', { 
      state: { workout } 
    });
  };

  const saveWorkout = () => {
    const focusLabel = (preferences.focusArea || 'workout').replace('-', ' ').toUpperCase();
    const workoutName = `${focusLabel} - ${preferences.duration}MIN`;
    
    const savedWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      workout,
      preferences,
      savedAt: new Date(),
      timesCompleted: 0,
    };
    
    const existingSaved = JSON.parse(localStorage.getItem('vibe-gyming-saved') || '[]');
    const updatedSaved = [...existingSaved, savedWorkout];
    localStorage.setItem('vibe-gyming-saved', JSON.stringify(updatedSaved));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-wider">YOUR WORKOUT PLAN</h1>
            <p className="text-muted-foreground text-sm">
              {preferences.duration} min • {(preferences.focusArea || 'workout').replace('-', ' ')} • {preferences.intensity} intensity
            </p>
          </div>
        </div>

        {/* Workout Overview */}
        <div className="mb-8 p-6 border border-border rounded-lg bg-card">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <div className="text-2xl font-bold">{workout.exercises.length}</div>
              <div className="text-xs text-muted-foreground tracking-wider">EXERCISES</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              <div className="text-2xl font-bold">{Math.round(workout.totalDuration / 60)}</div>
              <div className="text-xs text-muted-foreground tracking-wider">MINUTES</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <div className="text-2xl font-bold">{workout.estimatedCalories}</div>
              <div className="text-xs text-muted-foreground tracking-wider">CALORIES</div>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-bold tracking-wider text-foreground">WORKOUT BREAKDOWN</h2>
          {workout.exercises.map((exercise, index) => (
            <div key={exercise.id} className="p-6 border border-border rounded-lg bg-card">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold tracking-wide mb-2">{exercise.name}</h3>
                  
                  {/* Exercise Details */}
                  <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                    {exercise.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exercise.duration}s
                      </span>
                    )}
                    {exercise.sets && exercise.reps && (
                      <span>{exercise.sets} sets × {exercise.reps} reps</span>
                    )}
                    {exercise.restAfter && (
                      <span>Rest: {exercise.restAfter}s</span>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold tracking-wide mb-2 text-foreground">INSTRUCTIONS:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exercise.instructions}
                    </p>
                  </div>

                  {/* Form Tips */}
                  {exercise.formTips && exercise.formTips.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold tracking-wide mb-2 text-foreground">FORM TIPS:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {exercise.formTips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={startWorkout}
            className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg tracking-wider rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            START WORKOUT
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generateNewWorkout}
              disabled={isGenerating}
              className="py-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-bold tracking-wider bg-card disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  GENERATING...
                </>
              ) : (
                'TRY ANOTHER'
              )}
            </button>
            
            <button
              onClick={saveWorkout}
              className="py-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-bold tracking-wider bg-card flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              SAVE WORKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlan;