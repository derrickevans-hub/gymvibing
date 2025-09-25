import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-minimal';
import { Card } from '@/components/ui/card';
import { WorkoutPreferences, Workout, UserStats, FocusArea } from '@/types/exercise';
import { WorkoutGenerator } from '@/utils/workoutGenerator';
import WorkoutTimer from '@/components/WorkoutTimer';
import { 
  Play,
  ArrowLeft,
  Clock,
  MapPin,
  Dumbbell,
  Target,
  Zap,
  Heart,
  Cpu,
  Activity
} from 'lucide-react';

// Enhanced preferences type
interface EnhancedWorkoutPreferences extends WorkoutPreferences {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: 5 | 10 | 15 | 20 | 30;
  focusArea: 'upper-body' | 'lower-body' | 'core' | 'full-body' | 'cardio' | 'functional' | 'mobility';
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'questionnaire' | 'workout'>('home');
  const [questionStep, setQuestionStep] = useState(0);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    totalWorkouts: 0,
    totalMinutes: 0,
  });

  const [preferences, setPreferences] = useState<EnhancedWorkoutPreferences>({
    timeMinutes: 15,
    spaceType: 'normal',
    energyLevel: 'medium',
    equipment: 'none',
    spaceSize: 'big',
    hasWeights: false,
    intensity: 'moderate',
    duration: 15,
    focusArea: 'full-body',
  });

  // Load user stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('microfit-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  // Save user stats to localStorage
  const updateStats = (newStats: Partial<UserStats>) => {
    const updated = { ...userStats, ...newStats };
    setUserStats(updated);
    localStorage.setItem('microfit-stats', JSON.stringify(updated));
  };

  const generateWorkout = () => {
    const newWorkout = WorkoutGenerator.generateWorkout(preferences);
    setWorkout(newWorkout);
    setCurrentView('workout');
  };

  const handleWorkoutComplete = () => {
    if (workout) {
      const today = new Date().toDateString();
      const lastWorkout = userStats.lastWorkoutDate ? new Date(userStats.lastWorkoutDate).toDateString() : null;
      
      let newStreak = userStats.streak;
      if (lastWorkout === today) {
        // Already worked out today
      } else if (lastWorkout === new Date(Date.now() - 86400000).toDateString()) {
        newStreak = userStats.streak + 1;
      } else {
        newStreak = 1;
      }

      updateStats({
        streak: newStreak,
        totalWorkouts: userStats.totalWorkouts + 1,
        totalMinutes: userStats.totalMinutes + preferences.duration,
        lastWorkoutDate: new Date(),
      });
    }
    
    setCurrentView('home');
    setWorkout(null);
    setQuestionStep(0);
  };

  const startQuestionnaire = () => {
    setCurrentView('questionnaire');
    setQuestionStep(0);
  };

  const nextQuestion = () => {
    if (questionStep < 6) {
      setQuestionStep(questionStep + 1);
    } else {
      generateWorkout();
    }
  };

  const prevQuestion = () => {
    if (questionStep > 0) {
      setQuestionStep(questionStep - 1);
    } else {
      setCurrentView('home');
    }
  };

  if (currentView === 'workout' && workout) {
    return (
      <WorkoutTimer
        exercises={workout.exercises}
        onComplete={handleWorkoutComplete}
        onExit={() => {
          setCurrentView('home');
          setWorkout(null);
          setQuestionStep(0);
        }}
      />
    );
  }

  if (currentView === 'questionnaire') {
    const questions = [
      // Question 1: Space Size
      {
        title: "SPACE SIZE",
        subtitle: "How much room do you have?",
        icon: <MapPin className="w-6 h-6" />,
        options: [
          { key: 'small', label: 'SMALL SPACE', description: 'Apartment, office, hotel room' },
          { key: 'big', label: 'BIG SPACE', description: 'Gym, yard, large room' }
        ],
        currentValue: preferences.spaceSize,
        onChange: (value: string) => setPreferences(prev => ({ ...prev, spaceSize: value as 'small' | 'big' }))
      },
      // Question 2: Equipment
      {
        title: "EQUIPMENT",
        subtitle: "What do you have available?",
        icon: <Dumbbell className="w-6 h-6" />,
        options: [
          { key: false, label: 'NO WEIGHTS', description: 'Bodyweight only' },
          { key: true, label: 'HAVE WEIGHTS', description: 'Dumbbells, kettlebells, etc.' }
        ],
        currentValue: preferences.hasWeights,
        onChange: (value: boolean) => setPreferences(prev => ({ ...prev, hasWeights: value }))
      },
      // Question 3: Intensity
      {
        title: "INTENSITY",
        subtitle: "How hard do you want to push?",
        icon: <Zap className="w-6 h-6" />,
        options: [
          { key: 'light', label: 'LIGHT', description: 'Easy movement, recovery' },
          { key: 'moderate', label: 'MODERATE', description: 'Steady effort' },
          { key: 'intense', label: 'INTENSE', description: 'High energy, challenging' }
        ],
        currentValue: preferences.intensity,
        onChange: (value: string) => setPreferences(prev => ({ ...prev, intensity: value as 'light' | 'moderate' | 'intense' }))
      },
      // Question 4: Duration
      {
        title: "DURATION",
        subtitle: "How long can you workout?",
        icon: <Clock className="w-6 h-6" />,
        options: [
          { key: 5, label: '5 MIN', description: 'Quick burst' },
          { key: 10, label: '10 MIN', description: 'Short session' },
          { key: 15, label: '15 MIN', description: 'Standard workout' },
          { key: 20, label: '20 MIN', description: 'Extended session' },
          { key: 30, label: '30 MIN', description: 'Full workout' }
        ],
        currentValue: preferences.duration,
        onChange: (value: number) => setPreferences(prev => ({ ...prev, duration: value as 5 | 10 | 15 | 20 | 30, timeMinutes: value as 2 | 3 | 5 }))
      },
      // Question 5: Focus Area - Body Parts
      {
        title: "FOCUS AREA",
        subtitle: "What do you want to target?",
        icon: <Target className="w-6 h-6" />,
        options: [
          { key: 'upper-body', label: 'UPPER BODY', description: 'Arms, chest, shoulders, back' },
          { key: 'lower-body', label: 'LOWER BODY', description: 'Legs, glutes, calves' },
          { key: 'core', label: 'CORE', description: 'Abs, obliques, lower back' },
          { key: 'full-body', label: 'FULL BODY', description: 'Complete workout' }
        ],
        currentValue: preferences.focusArea,
        onChange: (value: string) => setPreferences(prev => ({ ...prev, focusArea: value as any }))
      },
      // Question 6: Workout Type
      {
        title: "WORKOUT TYPE",
        subtitle: "What style of training?",
        icon: <Activity className="w-6 h-6" />,
        options: [
          { key: 'cardio', label: 'CARDIO', description: 'Heart rate, endurance' },
          { key: 'functional', label: 'FUNCTIONAL', description: 'Movement patterns, strength' },
          { key: 'mobility', label: 'MOBILITY', description: 'Flexibility, stretching' }
        ],
        currentValue: preferences.focusArea,
        onChange: (value: string) => setPreferences(prev => ({ ...prev, focusArea: value as any }))
      }
    ];

    const currentQuestion = questions[questionStep];

    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevQuestion}
                className="p-2 hover:bg-white/10 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium">
                {questionStep + 1} / {questions.length}
              </div>
            </div>
            <div className="w-full bg-white/20 h-1 rounded">
              <div 
                className="bg-white h-1 rounded transition-all duration-300"
                style={{ width: `${((questionStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 border border-white/30 rounded-lg flex items-center justify-center">
                {currentQuestion.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider">{currentQuestion.title}</h1>
                <p className="text-white/70 text-sm">{currentQuestion.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-12">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  currentQuestion.onChange(option.key);
                  setTimeout(nextQuestion, 150);
                }}
                className={`w-full p-4 border rounded-lg transition-all duration-200 text-left ${
                  currentQuestion.currentValue === option.key
                    ? 'bg-white text-black border-white'
                    : 'bg-black border-white/30 hover:border-white/60 hover:bg-white/5'
                }`}
              >
                <div className="font-bold text-sm tracking-wider mb-1">
                  {option.label}
                </div>
                <div className={`text-xs ${
                  currentQuestion.currentValue === option.key ? 'text-black/70' : 'text-white/50'
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>

          {/* Skip button */}
          <button
            onClick={nextQuestion}
            className="w-full py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors"
          >
            SKIP
          </button>
        </div>
      </div>
    );
  }

  // Home screen
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-wider mb-2">MICROFIT</h1>
          <div className="w-16 h-px bg-white mx-auto mb-4"></div>
          <p className="text-white/60 text-sm tracking-wide">QUICK WORKOUTS FOR BUSY SCHEDULES</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          <div className="text-center p-4 border border-white/20 rounded-lg">
            <div className="text-2xl font-bold mb-1">{userStats.streak}</div>
            <div className="text-xs text-white/60 tracking-wider">STREAK</div>
          </div>
          
          <div className="text-center p-4 border border-white/20 rounded-lg">
            <div className="text-2xl font-bold mb-1">{userStats.totalWorkouts}</div>
            <div className="text-xs text-white/60 tracking-wider">SESSIONS</div>
          </div>
          
          <div className="text-center p-4 border border-white/20 rounded-lg">
            <div className="text-2xl font-bold mb-1">{userStats.totalMinutes}</div>
            <div className="text-xs text-white/60 tracking-wider">MINUTES</div>
          </div>
        </div>

        {/* Main CTA */}
        <div className="mb-16">
          <button
            onClick={startQuestionnaire}
            className="w-full h-16 bg-white text-black font-bold text-lg tracking-wider rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            START WORKOUT
          </button>
        </div>

        {/* Quick presets */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-white/60 tracking-wider mb-6">QUICK OPTIONS</h3>
          
          <button
            onClick={() => {
              setPreferences({
                ...preferences,
                spaceSize: 'small',
                hasWeights: false,
                intensity: 'light',
                duration: 5,
                focusArea: 'mobility'
              });
              generateWorkout();
            }}
            className="w-full text-left p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="font-bold text-sm tracking-wide mb-1">DESK BREAK</div>
            <div className="text-xs text-white/50">5 MIN • MOBILITY • NO EQUIPMENT</div>
          </button>
          
          <button
            onClick={() => {
              setPreferences({
                ...preferences,
                spaceSize: 'big',
                hasWeights: false,
                intensity: 'intense',
                duration: 10,
                focusArea: 'cardio'
              });
              generateWorkout();
            }}
            className="w-full text-left p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="font-bold text-sm tracking-wide mb-1">ENERGY BOOST</div>
            <div className="text-xs text-white/50">10 MIN • CARDIO • HIGH INTENSITY</div>
          </button>
          
          <button
            onClick={() => {
              setPreferences({
                ...preferences,
                spaceSize: 'big',
                hasWeights: true,
                intensity: 'moderate',
                duration: 20,
                focusArea: 'full-body'
              });
              generateWorkout();
            }}
            className="w-full text-left p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="font-bold text-sm tracking-wide mb-1">FULL SESSION</div>
            <div className="text-xs text-white/50">20 MIN • FULL BODY • WITH WEIGHTS</div>
          </button>
        </div>

        {/* Streak encouragement */}
        {userStats.streak > 0 && (
          <div className="mt-12 p-4 border border-white/30 rounded-lg text-center">
            <div className="font-bold text-sm tracking-wider mb-1">
              {userStats.streak} DAY STREAK
            </div>
            <div className="text-xs text-white/60">
              KEEP THE MOMENTUM GOING
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
