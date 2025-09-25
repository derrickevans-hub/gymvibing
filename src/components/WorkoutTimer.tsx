import React, { useState, useEffect } from 'react';
import ExerciseIllustration from './ExerciseIllustration';
import { Exercise } from '@/types/exercise';
import { Play, Pause, X, Bookmark } from 'lucide-react';

interface WorkoutTimerProps {
  exercises: Exercise[];
  onComplete: () => void;
  onExit: () => void;
  onSaveWorkout?: () => void;
}

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({ exercises, onComplete, onExit, onSaveWorkout }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.duration || 0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'workout' | 'rest' | 'complete'>('workout');

  useEffect(() => {
    setTimeLeft(exercises[currentExerciseIndex]?.duration || 0);
  }, [currentExerciseIndex, exercises]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentPhase === 'workout') {
      // Exercise finished
      const exercise = exercises[currentExerciseIndex];
      if (exercise.restAfter && exercise.restAfter > 0) {
        setCurrentPhase('rest');
        setTimeLeft(exercise.restAfter);
        setIsRunning(true);
      } else {
        handleNext();
      }
    } else if (timeLeft === 0 && currentPhase === 'rest') {
      handleNext();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, currentPhase, currentExerciseIndex, exercises]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentPhase('workout');
      setIsRunning(false);
    } else {
      setCurrentPhase('complete');
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete screen
  if (currentPhase === 'complete') {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="text-6xl mb-8">🎉</div>
          <h1 className="text-2xl font-bold tracking-wider mb-4">WORKOUT COMPLETE!</h1>
          <p className="text-white/60 text-sm mb-12">Great job finishing your workout session</p>
          
          <div className="space-y-4">
            <button
              onClick={onComplete}
              className="w-full py-3 bg-white text-black font-bold text-sm tracking-wider rounded-lg hover:bg-white/90 transition-colors"
            >
              CONTINUE
            </button>
            <button
              onClick={onExit}
              className="w-full py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors font-bold tracking-wider"
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rest screen
  if (currentPhase === 'rest') {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onExit} className="p-2 hover:bg-white/10 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-sm font-medium">{currentExerciseIndex + 1} / {exercises.length}</div>
              <div className="text-xs text-white/60 uppercase tracking-wider">REST</div>
            </div>
            <div className="w-9 h-9"></div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-wider mb-8">TAKE A BREAK</h1>
            <div className="text-6xl font-bold mb-8">{formatTime(timeLeft)}</div>
            
            <div className="text-sm text-white/60 mb-8">
              Next: {exercises[currentExerciseIndex + 1]?.name || 'Finish'}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors font-bold tracking-wider"
            >
              SKIP REST
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main workout screen
  if (currentPhase === 'workout') {
    const exercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onExit}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="text-sm font-medium">
                {currentExerciseIndex + 1} / {exercises.length}
              </div>
              <div className="text-xs text-white/60 uppercase tracking-wider">
                {exercise.category}
              </div>
            </div>

            <button 
              onClick={onSaveWorkout}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 h-1 rounded mb-8">
            <div 
              className="bg-white h-1 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Exercise illustration */}
          <div className="flex justify-center mb-8">
            <ExerciseIllustration exerciseName={exercise.name} />
          </div>

          {/* Exercise info */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wider mb-4">{exercise.name}</h1>
            
            <div className="text-sm text-white/80 mb-6 leading-relaxed">
              {exercise.instructions}
            </div>

            {/* Form tips */}
            <div className="text-left bg-white/5 rounded-lg p-4 mb-6">
              <div className="text-xs font-bold text-white/70 mb-3 tracking-wider">FORM TIPS</div>
              <ul className="space-y-2">
                {exercise.formTips.map((tip, index) => (
                  <li key={index} className="text-xs text-white/60 flex items-start gap-2">
                    <span className="text-white/40 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timer display */}
            <div className="text-6xl font-bold mb-2">{formatTime(timeLeft)}</div>
            
            {exercise.reps && (
              <div className="text-sm text-white/60 mb-6">
                Target: {exercise.reps} reps
              </div>
            )}
          </div>

          {/* Control buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
              disabled={currentExerciseIndex === 0}
              className="flex-1 py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wider"
            >
              PREVIOUS
            </button>
            
            <button
              onClick={toggleTimer}
              className="flex-1 py-3 bg-white text-black rounded-lg text-sm hover:bg-white/90 transition-colors font-bold tracking-wider flex items-center justify-center gap-2"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'PAUSE' : 'START'}
            </button>
            
            <button
              onClick={handleNext}
              className="flex-1 py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors font-bold tracking-wider"
            >
              {currentExerciseIndex === exercises.length - 1 ? 'FINISH' : 'NEXT'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WorkoutTimer;