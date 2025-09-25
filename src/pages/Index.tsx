import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-minimal';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  Activity,
  Bookmark,
  X
} from 'lucide-react';

// Enhanced preferences type
interface EnhancedWorkoutPreferences extends WorkoutPreferences {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: 5 | 10 | 15 | 20 | 30;
  focusArea: 'upper-body' | 'lower-body' | 'core' | 'full-body' | 'cardio' | 'functional' | 'mobility';
  notes: string;
}

// Saved workout interface
interface SavedWorkout {
  id: string;
  name: string;
  workout: Workout;
  preferences: EnhancedWorkoutPreferences;
  savedAt: Date;
  timesCompleted: number;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'questionnaire' | 'workout' | 'saved'>('home');
  const [questionStep, setQuestionStep] = useState(0);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    totalWorkouts: 0,
    totalMinutes: 0,
  });

  const [preferences, setPreferences] = useState<EnhancedWorkoutPreferences>({
    timeMinutes: 5,
    spaceType: 'normal',
    energyLevel: 'medium',
    equipment: 'none',
    spaceSize: 'big',
    hasWeights: false,
    intensity: 'moderate',
    duration: 15,
    focusArea: 'full-body',
    notes: '',
  });

  // Load user stats and saved workouts from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('vibe-gyming-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
    
    const savedWorkoutsData = localStorage.getItem('vibe-gyming-saved');
    if (savedWorkoutsData) {
      setSavedWorkouts(JSON.parse(savedWorkoutsData));
    }
  }, []);

  // Save user stats to localStorage
  const updateStats = (newStats: Partial<UserStats>) => {
    const updated = { ...userStats, ...newStats };
    setUserStats(updated);
    localStorage.setItem('vibe-gyming-stats', JSON.stringify(updated));
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

  // Save workout functions
  const saveCurrentWorkout = () => {
    if (!workout) return;
    
    const focusLabel = preferences.focusArea.replace('-', ' ').toUpperCase();
    const workoutName = `${focusLabel} - ${preferences.duration}MIN`;
    
    const savedWorkout: SavedWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      workout,
      preferences,
      savedAt: new Date(),
      timesCompleted: 0,
    };
    
    const updatedSaved = [...savedWorkouts, savedWorkout];
    setSavedWorkouts(updatedSaved);
    localStorage.setItem('vibe-gyming-saved', JSON.stringify(updatedSaved));
  };

  const loadSavedWorkout = (savedWorkout: SavedWorkout) => {
    setWorkout(savedWorkout.workout);
    setPreferences(savedWorkout.preferences);
    
    // Update times completed
    const updatedSaved = savedWorkouts.map(sw => 
      sw.id === savedWorkout.id 
        ? { ...sw, timesCompleted: sw.timesCompleted + 1 }
        : sw
    );
    setSavedWorkouts(updatedSaved);
    localStorage.setItem('vibe-gyming-saved', JSON.stringify(updatedSaved));
    
    setCurrentView('workout');
  };

  const deleteSavedWorkout = (workoutId: string) => {
    const updatedSaved = savedWorkouts.filter(sw => sw.id !== workoutId);
    setSavedWorkouts(updatedSaved);
    localStorage.setItem('vibe-gyming-saved', JSON.stringify(updatedSaved));
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
        onSaveWorkout={saveCurrentWorkout}
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
            { key: 'false', label: 'NO WEIGHTS', description: 'Bodyweight only' },
            { key: 'true', label: 'HAVE WEIGHTS', description: 'Dumbbells, kettlebells, etc.' }
          ],
          currentValue: preferences.hasWeights.toString(),
          onChange: (value: string) => setPreferences(prev => ({ ...prev, hasWeights: value === 'true' }))
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
          { key: '5', label: '5 MIN', description: 'Quick burst' },
          { key: '10', label: '10 MIN', description: 'Short session' },
          { key: '15', label: '15 MIN', description: 'Standard workout' },
          { key: '20', label: '20 MIN', description: 'Extended session' },
          { key: '30', label: '30 MIN', description: 'Full workout' }
        ],
        currentValue: preferences.duration.toString(),
        onChange: (value: string) => {
          const duration = parseInt(value) as 5 | 10 | 15 | 20 | 30;
          const timeMinutes = duration <= 5 ? 5 : duration <= 10 ? 3 : 2;
          setPreferences(prev => ({ ...prev, duration, timeMinutes: timeMinutes as 2 | 3 | 5 }));
        }
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
        onChange: (value: string) => setPreferences(prev => ({ ...prev, focusArea: value as 'upper-body' | 'lower-body' | 'core' | 'full-body' | 'cardio' | 'functional' | 'mobility' }))
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
        onChange: (value: string) => setPreferences(prev => ({ ...prev, focusArea: value as 'upper-body' | 'lower-body' | 'core' | 'full-body' | 'cardio' | 'functional' | 'mobility' }))
      },
      // Question 7: Notes
      {
        title: "NOTES",
        subtitle: "Any injuries or things to avoid?",
        icon: <Heart className="w-6 h-6" />,
        currentValue: preferences.notes,
        onChange: (value: string) => setPreferences(prev => ({ ...prev, notes: value })),
        isTextArea: true
      }
    ];

    const currentQuestion = questions[questionStep];
    if (!currentQuestion) return null;

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

          {/* Options or Text Area */}
          <div className="space-y-4 mb-12">
            {currentQuestion.isTextArea ? (
              <div>
                <Textarea
                  value={currentQuestion.currentValue as string}
                  onChange={(e) => currentQuestion.onChange(e.target.value)}
                  placeholder="e.g. lower back pain, knee issues, avoid jumping..."
                  rows={4}
                  className="w-full bg-black border-white/30 text-white placeholder:text-white/50 focus:border-white/60 font-mono"
                />
                <p className="text-xs text-white/50 mt-2">Leave blank if none apply</p>
              </div>
            ) : (
              currentQuestion.options?.map((option, index) => (
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
              ))
            )}
          </div>

          {/* Action button */}
          <button
            onClick={nextQuestion}
            className="w-full py-3 border border-white/30 rounded-lg text-sm hover:bg-white/5 transition-colors font-bold tracking-wider"
          >
            {questionStep === questions.length - 1 ? 'GENERATE WORKOUT' : 'SKIP'}
          </button>
        </div>
      </div>
    );
  }

  // Saved workouts screen
  if (currentView === 'saved') {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-wider">SAVED WORKOUTS</h1>
              <p className="text-white/60 text-sm">Your favorite routines</p>
            </div>
          </div>

          {/* Empty state */}
          {savedWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 border border-white/30 rounded-lg flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-white/60" />
              </div>
              <h2 className="text-lg font-bold tracking-wider mb-2">NO SAVED WORKOUTS YET</h2>
              <p className="text-white/60 text-sm mb-8">Save your favorite routines for quick access</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-white text-black font-bold text-sm tracking-wider rounded-lg hover:bg-white/90 transition-colors"
              >
                CREATE YOUR FIRST WORKOUT
              </button>
            </div>
          ) : (
            /* Saved workouts list */
            <div className="space-y-4">
              {savedWorkouts.map((savedWorkout) => (
                <div key={savedWorkout.id} className="p-4 border border-white/20 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm tracking-wider mb-1">{savedWorkout.name}</h3>
                      <div className="text-xs text-white/50">
                        {savedWorkout.workout.exercises.length} exercises • {savedWorkout.preferences.duration} min
                      </div>
                      <div className="text-xs text-white/50">
                        Completed {savedWorkout.timesCompleted} times
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSavedWorkout(savedWorkout.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => loadSavedWorkout(savedWorkout)}
                    className="w-full py-2 bg-white text-black font-bold text-sm tracking-wider rounded hover:bg-white/90 transition-colors"
                  >
                    START WORKOUT
                  </button>
                </div>
              ))}
            </div>
          )}
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
          <h1 className="text-4xl font-bold tracking-wider mb-2">VIBE GYMING</h1>
          <div className="w-16 h-px bg-white mx-auto mb-4"></div>
          <p className="text-white/60 text-sm tracking-wide">WORKOUTS THAT MATCH YOUR ENERGY</p>
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

        {/* Saved Workouts */}
        <div className="mb-16">
          <button
            onClick={() => setCurrentView('saved')}
            className="w-full text-left p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-bold text-sm tracking-wide mb-1">SAVED WORKOUTS</div>
                <div className="text-xs text-white/50">{savedWorkouts.length} routines saved</div>
              </div>
            </div>
          </button>
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
                focusArea: 'mobility',
                notes: ''
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
                focusArea: 'cardio',
                notes: ''
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
                focusArea: 'full-body',
                notes: ''
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