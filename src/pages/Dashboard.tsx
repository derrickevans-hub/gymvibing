import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button-minimal';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutPreferences, Workout, UserStats } from '@/types/exercise';
import WorkoutTimer from '@/components/WorkoutTimer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play,
  ArrowLeft,
  Clock,
  MapPin,
  Dumbbell,
  Target,
  Zap,
  Heart,
  Activity,
  Bookmark,
  X,
  Loader2,
  LogOut
} from 'lucide-react';

import { ClaudeWorkoutGenerator as ClaudeWG } from '@/utils/claudeWorkoutGenerator';

// Enhanced preferences type
interface EnhancedWorkoutPreferences extends WorkoutPreferences {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'home' | 'questionnaire' | 'workout-preview' | 'workout' | 'saved'>('home');
  const [questionStep, setQuestionStep] = useState(0);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);
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

  // Load user stats and saved workouts from localStorage and database
  useEffect(() => {
    // Check auth state
    checkAuth();
    
    const savedStats = localStorage.getItem('vibe-gyming-stats');
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadSavedWorkouts();
        } else {
          setSavedWorkouts([]);
          // Removed redirect to allow guest access for testing
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadSavedWorkouts();
    }
    // Removed redirect to allow guest access for testing
  };

  const loadSavedWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('saved_workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading saved workouts:', error);
          return;
        }

        // Convert database format to app format
        const convertedWorkouts = data?.map(savedWorkout => ({
          id: savedWorkout.id,
          name: savedWorkout.name,
          workout: savedWorkout.workout_data as unknown as Workout,
          preferences: savedWorkout.preferences as unknown as EnhancedWorkoutPreferences,
          savedAt: new Date(savedWorkout.created_at),
          timesCompleted: savedWorkout.times_completed,
        })) || [];

        setSavedWorkouts(convertedWorkouts);
      }
    } catch (error) {
      console.error('Error loading saved workouts:', error);
    }
  };

  // Save user stats to localStorage
  const updateStats = (newStats: Partial<UserStats>) => {
    const updated = { ...userStats, ...newStats };
    setUserStats(updated);
    localStorage.setItem('vibe-gyming-stats', JSON.stringify(updated));
  };

  const generateWorkout = async () => {
    setIsGenerating(true);
    try {
      const aiRequest = {
        spaceSize: preferences.spaceSize,
        hasWeights: preferences.hasWeights,
        intensity: preferences.intensity,
        duration: preferences.duration,
        focusArea: preferences.focusArea,
        notes: preferences.notes,
      };
      
      const newWorkout = await ClaudeWG.generateWorkout(aiRequest);
      
      // Navigate to workout plan page with the generated workout
      navigate('/workout-plan', { 
        state: { 
          workout: newWorkout, 
          preferences: {
            spaceSize: preferences.spaceSize,
            hasWeights: preferences.hasWeights,
            intensity: preferences.intensity,
            duration: preferences.duration,
            focusArea: preferences.focusArea,
            notes: preferences.notes
          }
        } 
      });
    } catch (error) {
      console.error('Failed to generate workout:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startWorkout = () => {
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

  const loadSavedWorkout = async (savedWorkout: SavedWorkout) => {
    try {
      setWorkout(savedWorkout.workout);
      setPreferences(savedWorkout.preferences);
      
      // Update times completed in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('saved_workouts')
          .update({ times_completed: savedWorkout.timesCompleted + 1 })
          .eq('id', savedWorkout.id)
          .eq('user_id', user.id);
      }
      
      // Update local state
      const updatedSaved = savedWorkouts.map(sw => 
        sw.id === savedWorkout.id 
          ? { ...sw, timesCompleted: sw.timesCompleted + 1 }
          : sw
      );
      setSavedWorkouts(updatedSaved);
      
      setCurrentView('workout');
    } catch (error) {
      console.error('Error loading saved workout:', error);
    }
  };

  const deleteSavedWorkout = async (workoutId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('saved_workouts')
          .delete()
          .eq('id', workoutId)
          .eq('user_id', user.id);
      }
      
      const updatedSaved = savedWorkouts.filter(sw => sw.id !== workoutId);
      setSavedWorkouts(updatedSaved);
    } catch (error) {
      console.error('Error deleting saved workout:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSavedWorkouts([]);
    navigate('/');
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const nextQuestion = async () => {
    if (questionStep < 6) {
      setQuestionStep(questionStep + 1);
    } else {
      await generateWorkout();
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
          setCurrentView('workout-preview');
          setQuestionStep(0);
        }}
        onSaveWorkout={() => {}}
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
        currentValue: preferences.duration.toString(),
        onChange: (value: string) => {
          const duration = parseInt(value);
          const timeMinutes = duration <= 5 ? 5 : duration <= 10 ? 3 : 2;
          setPreferences(prev => ({ ...prev, duration, timeMinutes: timeMinutes as 2 | 3 | 5 }));
        },
        isSelect: true
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

    return (
      <div className="min-h-screen bg-background text-foreground font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={prevQuestion}
                className="p-2 hover:bg-muted rounded transition-colors"
                disabled={isGenerating}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium">
                {questionStep + 1} / {questions.length}
              </div>
            </div>
            <div className="w-full bg-muted h-1 rounded">
              <div 
                className="bg-primary h-1 rounded transition-all duration-300"
                style={{ width: `${((questionStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center bg-card">
                {currentQuestion.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider">{currentQuestion.title}</h1>
                <p className="text-muted-foreground text-sm">{currentQuestion.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Options, Select, or Text Area */}
          <div className="space-y-4 mb-12">
            {currentQuestion.isTextArea ? (
              <div>
                <Textarea
                  value={currentQuestion.currentValue as string}
                  onChange={(e) => currentQuestion.onChange(e.target.value)}
                  placeholder="e.g. lower back pain, knee issues, avoid jumping..."
                  rows={4}
                  className="w-full bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary font-mono"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-2">Leave blank if none apply</p>
              </div>
            ) : currentQuestion.isSelect ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '5', label: '5 min' },
                  { value: '10', label: '10 min' },
                  { value: '15', label: '15 min' },
                  { value: '20', label: '20 min' },
                  { value: '25', label: '25 min' },
                  { value: '30', label: '30 min' },
                  { value: '45', label: '45 min' },
                  { value: '60', label: '1 hr' },
                  { value: '90', label: '1h 30m' }
                ].map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => {
                      currentQuestion.onChange(duration.value);
                      setTimeout(nextQuestion, 150);
                    }}
                    disabled={isGenerating}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                      currentQuestion.currentValue === duration.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            ) : (
              currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    currentQuestion.onChange(option.key);
                    setTimeout(nextQuestion, 150);
                  }}
                  disabled={isGenerating}
                  className={`w-full p-4 border rounded-lg transition-all duration-200 text-left disabled:opacity-50 ${
                    currentQuestion.currentValue === option.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary hover:bg-muted'
                  }`}
                >
                  <div className="font-bold text-sm tracking-wider mb-1">
                    {option.label}
                  </div>
                  <div className={`text-xs ${
                    currentQuestion.currentValue === option.key 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {option.description}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Continue button for text area */}
          {currentQuestion.isTextArea && (
            <button
              onClick={nextQuestion}
              disabled={isGenerating}
              className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg tracking-wider rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  GENERATING YOUR WORKOUT...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6" />
                  GENERATE WORKOUT
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Saved workouts view
  if (currentView === 'saved') {
    return (
      <div className="min-h-screen bg-background text-foreground font-mono">
        <div className="max-w-md mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-2 hover:bg-muted rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-wider">SAVED WORKOUTS</h1>
              <p className="text-muted-foreground text-sm">{savedWorkouts.length} routines saved</p>
            </div>
          </div>

          {savedWorkouts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-6 border border-border rounded-lg flex items-center justify-center bg-card">
                <Bookmark className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold tracking-wider mb-2">NO SAVED WORKOUTS YET</h2>
              <p className="text-muted-foreground text-sm mb-8">Save your favorite routines for quick access</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-3 bg-primary text-primary-foreground font-bold text-sm tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
              >
                CREATE YOUR FIRST WORKOUT
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedWorkouts.map((savedWorkout) => (
                <div key={savedWorkout.id} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm tracking-wider mb-1">{savedWorkout.name}</h3>
                      <div className="text-xs text-muted-foreground">
                        {savedWorkout.workout.exercises.length} exercises • {savedWorkout.preferences.duration} min
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed {savedWorkout.timesCompleted} times
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSavedWorkout(savedWorkout.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => loadSavedWorkout(savedWorkout)}
                    className="w-full py-2 bg-primary text-primary-foreground font-bold text-sm tracking-wider rounded hover:bg-primary/90 transition-colors"
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
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <h1 className="text-4xl font-bold tracking-wider">VIBE GYMING</h1>
            <button
              onClick={signOut}
              className="p-2 hover:bg-muted rounded transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="w-16 h-px bg-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm tracking-wide">WORKOUTS THAT MATCH YOUR ENERGY</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          <div className="text-center p-4 border border-border rounded-lg bg-card">
            <div className="text-2xl font-bold mb-1">{userStats.streak}</div>
            <div className="text-xs text-muted-foreground tracking-wider">STREAK</div>
          </div>
          
          <div className="text-center p-4 border border-border rounded-lg bg-card">
            <div className="text-2xl font-bold mb-1">{userStats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground tracking-wider">SESSIONS</div>
          </div>
          
          <div className="text-center p-4 border border-border rounded-lg bg-card">
            <div className="text-2xl font-bold mb-1">{userStats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground tracking-wider">MINUTES</div>
          </div>
        </div>

        {/* Saved Workouts */}
        <div className="mb-16">
          <button
            onClick={() => setCurrentView('saved')}
            className="w-full text-left p-4 border border-border rounded-lg bg-card hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-bold text-sm tracking-wide mb-1">SAVED WORKOUTS</div>
                <div className="text-xs text-muted-foreground">{savedWorkouts.length} routines saved</div>
              </div>
            </div>
          </button>
        </div>

        {/* Main CTA */}
        <div className="mb-16">
          <button
            onClick={startQuestionnaire}
            disabled={isGenerating}
            className="w-full py-6 bg-primary text-primary-foreground font-bold text-xl tracking-wider rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Play className="w-8 h-8" />
                CREATE NEW WORKOUT
              </>
            )}
          </button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            AI-powered workouts in under 60 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
