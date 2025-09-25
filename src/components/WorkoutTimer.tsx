import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button-enhanced';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutTimerProps {
  exercises: Exercise[];
  onComplete: () => void;
  onExit: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ exercises, onComplete, onExit }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(exercises[0]?.duration || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const overallProgress = ((currentExerciseIndex + (1 - timeRemaining / currentExercise?.duration)) / totalExercises) * 100;

  useEffect(() => {
    if (currentExercise && timeRemaining !== currentExercise.duration) {
      setTimeRemaining(currentExercise.duration);
    }
  }, [currentExerciseIndex, currentExercise]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0 && !isCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next exercise or complete workout
            if (currentExerciseIndex < exercises.length - 1) {
              setCurrentExerciseIndex(idx => idx + 1);
              return exercises[currentExerciseIndex + 1].duration;
            } else {
              setIsCompleted(true);
              setIsPlaying(false);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, currentExerciseIndex, exercises, isCompleted]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSkip = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  }, [currentExerciseIndex, exercises.length]);

  const handleRepeat = useCallback(() => {
    setTimeRemaining(currentExercise.duration);
    setIsPlaying(false);
  }, [currentExercise?.duration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-success/10 to-primary/10">
        <div className="animate-scale-bounce text-center">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Workout Complete!</h2>
          <p className="text-muted-foreground mb-8">Great job finishing your micro-workout!</p>
          <div className="space-y-3">
            <Button variant="hero" size="xl" onClick={onComplete} className="w-full">
              Finish & Track Progress
            </Button>
            <Button variant="gentle" onClick={onExit} className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </span>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Exit
          </Button>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      {/* Current Exercise Card */}
      <Card className="workout-card mb-6 animate-slide-up">
        <div className="text-center">
          {/* Exercise Animation Placeholder */}
          <div className="exercise-demo mb-4">
            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
              <span className="text-3xl">🏃</span>
            </div>
          </div>
          
          {/* Exercise Info */}
          <h3 className="text-2xl font-bold text-foreground mb-2">{currentExercise.name}</h3>
          <p className="text-muted-foreground mb-4">{currentExercise.instructions}</p>
          
          {/* Timer Display */}
          <div className="mb-6">
            <div className={cn(
              "text-6xl font-bold mb-2 transition-colors duration-300",
              timeRemaining <= 5 ? "text-accent animate-bounce-gentle" : "text-primary"
            )}>
              {formatTime(timeRemaining)}
            </div>
            {currentExercise.reps && (
              <p className="text-sm text-muted-foreground">
                Target: {currentExercise.reps} reps
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="gentle"
          size="lg"
          onClick={handleRepeat}
          disabled={isPlaying}
        >
          <RotateCcw className="w-5 h-5" />
          Repeat
        </Button>
        
        <Button
          variant="hero"
          size="xl"
          onClick={handlePlayPause}
          className="px-12"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          {isPlaying ? 'Pause' : 'Start'}
        </Button>
        
        <Button
          variant="gentle"
          size="lg"
          onClick={handleSkip}
          disabled={currentExerciseIndex >= exercises.length - 1}
        >
          <SkipForward className="w-5 h-5" />
          Skip
        </Button>
      </div>

      {/* Exercise Queue */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Coming Up:</h4>
        <div className="space-y-2">
          {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((exercise, index) => (
            <div key={exercise.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">{exercise.name}</span>
              <span className="text-xs text-muted-foreground">{formatTime(exercise.duration)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTimer;