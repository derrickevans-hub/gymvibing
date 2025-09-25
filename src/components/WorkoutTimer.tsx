import React, { useState, useEffect, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button-minimal';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, X } from 'lucide-react';
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-2">Complete!</h2>
          <p className="text-muted-foreground mb-12">Nice work on your micro-workout</p>
          
          <div className="space-y-4">
            <Button variant="primary" size="xl" onClick={onComplete} className="w-full">
              Continue
            </Button>
            <Button variant="outline" onClick={onExit} className="w-full">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-sm mx-auto p-4">
        {/* Clean header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <div className="text-sm text-muted-foreground">
              {currentExerciseIndex + 1} of {totalExercises}
            </div>
            <Progress value={overallProgress} className="w-24 h-1 mt-2" />
          </div>
          <Button variant="ghost" size="icon" onClick={onExit}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Exercise content */}
        <div className="text-center mb-12">
          {/* Exercise demo */}
          <div className="exercise-demo">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💪</span>
            </div>
          </div>
          
          {/* Exercise info */}
          <h2 className="text-2xl font-semibold mb-3">{currentExercise.name}</h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            {currentExercise.instructions}
          </p>
          
          {/* Timer */}
          <div className="mb-8">
            <div className={cn(
              "text-5xl font-semibold mb-2 transition-colors duration-300 tabular-nums",
              timeRemaining <= 5 ? "text-primary animate-pulse" : "text-foreground"
            )}>
              {formatTime(timeRemaining)}
            </div>
            {currentExercise.reps && (
              <div className="text-sm text-muted-foreground">
                Target: {currentExercise.reps} reps
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRepeat}
            disabled={isPlaying}
            className="w-12 h-12"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="primary"
            size="floating"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkip}
            disabled={currentExerciseIndex >= exercises.length - 1}
            className="w-12 h-12"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Next exercises */}
        {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 2).length > 0 && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wider text-center">
              Next
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="font-medium text-sm">
                {exercises[currentExerciseIndex + 1]?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatTime(exercises[currentExerciseIndex + 1]?.duration || 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTimer;