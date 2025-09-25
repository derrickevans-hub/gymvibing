import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-minimal';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutPreferences, Workout, UserStats } from '@/types/exercise';
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
  Activity,
  Bookmark,
  X,
  Loader2
} from 'lucide-react';

// Claude API Integration
interface AIWorkoutRequest {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  focusArea: string;
  notes: string;
}

interface AIExercise {
  name: string;
  sets: number;
  reps: string;
  duration: number;
  instructions: string[];
  restTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
}

interface AIWorkoutResponse {
  title: string;
  totalDuration: number;
  exercises: AIExercise[];
  warmupAdvice: string;
  cooldownAdvice: string;
}

// Claude Workout Generator Service
class ClaudeWorkoutGenerator {
  private static async callClaude(preferences: AIWorkoutRequest): Promise<AIWorkoutResponse> {
    // Check if we have the API key
    const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('No Anthropic API key found, using fallback workout');
      return this.getFallbackWorkout(preferences);
    }

    const notesSection = preferences.notes.trim() 
      ? `\n- Special considerations/injuries to avoid: ${preferences.notes}` 
      : '';
      
    const prompt = `Create a ${preferences.duration}-minute ${preferences.intensity} intensity workout for someone with:
- Space: ${preferences.spaceSize} space
- Equipment: ${preferences.hasWeights ? 'has weights/dumbbells' : 'no equipment (bodyweight only)'}
- Focus: ${preferences.focusArea}${notesSection}

Requirements:
- Return ONLY valid JSON, no markdown or explanations
- Include 4-8 exercises depending on duration
- Each exercise should have: name, sets, reps (or time), instructions (3-4 bullet points), restTime, difficulty, muscleGroups
- Include warmup and cooldown advice
- Make instructions clear and beginner-friendly
- If notes mention injuries/limitations, modify exercises accordingly and avoid movements that could aggravate those areas
- Use this exact JSON structure:

{
  "title": "Workout Name",
  "totalDuration": ${preferences.duration},
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": 3,
      "reps": "10-12",
      "duration": 60,
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction", 
        "Step 3 instruction"
      ],
      "restTime": 30,
      "difficulty": "beginner",
      "muscleGroups": ["chest", "arms"]
    }
  ],
  "warmupAdvice": "Light movement for 2-3 minutes",
  "cooldownAdvice": "Gentle stretching for 2-3 minutes"
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      return JSON.parse(content);
    } catch (error) {
      console.error('Claude API Error:', error);
      return this.getFallbackWorkout(preferences);
    }
  }

  private static getFallbackWorkout(preferences: AIWorkoutRequest): AIWorkoutResponse {
    // Enhanced fallback workout based on preferences
    const exercises: AIExercise[] = [];
    
    // Base exercises by focus area and equipment
    if (preferences.focusArea === 'upper-body') {
      if (preferences.hasWeights) {
        exercises.push({
          name: "Dumbbell Chest Press",
          sets: 3,
          reps: "8-12",
          duration: 120,
          instructions: [
            "Lie on your back holding dumbbells above your chest",
            "Lower weights to chest level with control",
            "Press back up to starting position",
            "Keep your core engaged throughout"
          ],
          restTime: 60,
          difficulty: "beginner",
          muscleGroups: ["chest", "shoulders", "triceps"]
        });
      } else {
        exercises.push({
          name: "Push-ups",
          sets: 3,
          reps: "8-15",
          duration: 90,
          instructions: [
            "Start in plank position with hands under shoulders",
            "Lower your chest toward the ground",
            "Push back up maintaining straight line",
            "Modify on knees if needed"
          ],
          restTime: 45,
          difficulty: "beginner",
          muscleGroups: ["chest", "shoulders", "triceps", "core"]
        });
      }
    }

    if (preferences.focusArea === 'lower-body') {
      exercises.push({
        name: "Bodyweight Squats",
        sets: 3,
        reps: "12-20",
        duration: 90,
        instructions: [
          "Stand with feet shoulder-width apart",
          "Lower down as if sitting in a chair",
          "Keep chest up and knees behind toes",
          "Stand back up squeezing glutes"
        ],
        restTime: 45,
        difficulty: "beginner",
        muscleGroups: ["quads", "glutes", "hamstrings"]
      });
    }

    if (preferences.focusArea === 'core') {
      exercises.push({
        name: "Plank Hold",
        sets: 3,
        reps: "30-60 seconds",
        duration: 60,
        instructions: [
          "Start in push-up position on forearms",
          "Keep body in straight line from head to heels",
          "Engage core and breathe steadily",
          "Don't let hips sag or pike up"
        ],
        restTime: 30,
        difficulty: "beginner",
        muscleGroups: ["core", "shoulders"]
      });
    }

    if (preferences.focusArea === 'cardio') {
      if (preferences.spaceSize === 'big') {
        exercises.push({
          name: "Jumping Jacks",
          sets: 4,
          reps: "30 seconds",
          duration: 30,
          instructions: [
            "Start standing with feet together",
            "Jump feet apart while raising arms overhead",
            "Jump back to starting position",
            "Maintain steady rhythm"
          ],
          restTime: 30,
          difficulty: "beginner",
          muscleGroups: ["full-body", "cardiovascular"]
        });
      } else {
        exercises.push({
          name: "High Knees in Place",
          sets: 4,
          reps: "30 seconds",
          duration: 30,
          instructions: [
            "Stand in place and lift knees to hip level",
            "Pump arms as if running",
            "Land softly on balls of feet",
            "Keep core engaged"
          ],
          restTime: 30,
          difficulty: "beginner",
          muscleGroups: ["legs", "cardiovascular"]
        });
      }
    }

    if (preferences.focusArea === 'mobility') {
      exercises.push({
        name: "Cat-Cow Stretch",
        sets: 2,
        reps: "10-15",
        duration: 60,
        instructions: [
          "Start on hands and knees",
          "Arch back and look up (cow pose)",
          "Round spine and tuck chin (cat pose)",
          "Move slowly between positions"
        ],
        restTime: 15,
        difficulty: "beginner",
        muscleGroups: ["spine", "core"]
      });
    }

    // Add more exercises based on duration
    if (preferences.duration >= 15) {
      exercises.push({
        name: "Mountain Climbers",
        sets: 3,
        reps: "20 seconds",
        duration: 60,
        instructions: [
          "Start in plank position",
          "Alternate bringing knees to chest quickly",
          "Keep hips level and core tight",
          "Maintain plank position throughout"
        ],
        restTime: 40,
        difficulty: "intermediate",
        muscleGroups: ["core", "shoulders", "legs"]
      });
    }

    if (preferences.duration >= 20 && preferences.focusArea !== 'mobility') {
      exercises.push({
        name: "Lunges",
        sets: 3,
        reps: "8-12 each leg",
        duration: 120,
        instructions: [
          "Step forward into lunge position",
          "Lower until both knees at 90 degrees",
          "Push back to starting position",
          "Alternate legs or complete one side first"
        ],
        restTime: 45,
        difficulty: "beginner",
        muscleGroups: ["quads", "glutes", "hamstrings"]
      });
    }

    // Ensure we have enough exercises for the duration
    while (exercises.length < Math.ceil(preferences.duration / 4) && exercises.length < 8) {
      exercises.push({
        name: "Arm Circles",
        sets: 2,
        reps: "10 each direction",
        duration: 30,
        instructions: [
          "Extend arms out to sides",
          "Make small circles forward",
          "Then reverse direction",
          "Keep arms straight and controlled"
        ],
        restTime: 15,
        difficulty: "beginner",
        muscleGroups: ["shoulders"]
      });
    }

    return {
      title: `${preferences.focusArea.replace('-', ' ').toUpperCase()} ${preferences.intensity.toUpperCase()} WORKOUT`,
      totalDuration: preferences.duration,
      exercises: exercises.slice(0, Math.min(8, Math.ceil(preferences.duration / 3))),
      warmupAdvice: "Start with 2-3 minutes of light movement like marching in place or arm swings",
      cooldownAdvice: "Finish with 2-3 minutes of gentle stretching focusing on the muscles you worked"
    };
  }

  static async generateWorkout(preferences: AIWorkoutRequest): Promise<Workout> {
    const aiWorkout = await this.callClaude(preferences);
    
    // Convert AI response to your app's Workout format
    return {
      exercises: aiWorkout.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        instructions: exercise.instructions.join(' '),
        restTime: exercise.restTime
      })),
      totalDuration: aiWorkout.totalDuration * 60, // Convert to seconds
      warmupAdvice: aiWorkout.warmupAdvice,
      cooldownAdvice: aiWorkout.cooldownAdvice
    };
  }
}

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

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'questionnaire' | 'workout' | 'saved'>('home');
  const [questionStep, setQuestionStep] = useState(0);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const generateWorkout = async () => {
    setIsGenerating(true);
    try {
      const aiRequest: AIWorkoutRequest = {
        spaceSize: preferences.spaceSize,
        hasWeights: preferences.hasWeights,
        intensity: preferences.intensity,
        duration: preferences.duration,
        focusArea: preferences.focusArea,
        notes: preferences.notes,
      };
      
      const newWorkout = await ClaudeWorkoutGenerator.generateWorkout(aiRequest);
      setWorkout(newWorkout);
      setCurrentView('workout');
    } catch (error) {
      console.error('Failed to generate workout:', error);
    } finally {
      setIsGenerating(false);
    }
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
    if (!currentQuestion) return null;

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
                    currentQuestion.currentValue === option.key ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
            disabled={isGenerating}
            className="w-full py-3 border border-border rounded-lg text-sm hover:bg-muted transition-colors font-bold tracking-wider bg-card disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                GENERATING WORKOUT...
              </>
            ) : (
              questionStep === questions.length - 1 ? 'GENERATE WORKOUT' : 'SKIP'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Saved workouts screen
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
              <h1 className="text-xl font-bold tracking-wider">SAVED WORKOUTS</h1>
              <p className="text-muted-foreground text-sm">Your favorite routines</p>
            </div>
          </div>

          {/* Empty state */}
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
            /* Saved workouts list */
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
          <h1 className="text-4xl font-bold tracking-wider mb-2">VIBE GYMING</h1>
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
            className="w-full h-16 bg-primary text-primary-foreground font-bold text-lg tracking-wider rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                GENERATING...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                START WORKOUT
              </>
            )}
          </button>
        </div>

        {/* Quick presets */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground tracking-wider mb-6">QUICK OPTIONS</h3>
          
          <button
            onClick={async () => {
              setPreferences({
                ...preferences,
                spaceSize: 'small',
                hasWeights: false,
                intensity: 'light',
                duration: 5,
                focusArea: 'mobility',
                notes: ''
              });
              await generateWorkout();
            }}
            disabled={isGenerating}
            className="w-full text-left p-4 border border-border rounded-lg bg-card hover:bg-muted transition-colors disabled:opacity-50"
          >
            <div className="font-bold text-sm tracking-wide mb-1">DESK BREAK</div>
            <div className="text-xs text-muted-foreground">5 MIN • MOBILITY • NO EQUIPMENT</div>
          </button>
          
          <button
            onClick={async () => {
              setPreferences({
                ...preferences,
                spaceSize: 'big',
                hasWeights: false,
                intensity: 'intense',
                duration: 10,
                focusArea: 'cardio',
                notes: ''
              });
              await generateWorkout();
            }}
            disabled={isGenerating}
            className="w-full text-left p-4 border border-border rounded-lg bg-card hover:bg-muted transition-colors disabled:opacity-50"
          >
            <div className="font-bold text-sm tracking-wide mb-1">ENERGY BOOST</div>
            <div className="text-xs text-muted-foreground">10 MIN • CARDIO • HIGH INTENSITY</div>
          </button>
          
          <button
            onClick={async () => {
              setPreferences({
                ...preferences,
                spaceSize: 'big',
                hasWeights: true,
                intensity: 'moderate',
                duration: 20,
                focusArea: 'full-body',
                notes: ''
              });
              await generateWorkout();
            }}
            disabled={isGenerating}
            className="w-full text-left p-4 border border-border rounded-lg bg-card hover:bg-muted transition-colors disabled:opacity-50"
          >
            <div className="font-bold text-sm tracking-wide mb-1">FULL SESSION</div>
            <div className="text-xs text-muted-foreground">20 MIN • FULL BODY • WITH WEIGHTS</div>
          </button>
        </div>

        {/* Streak encouragement */}
        {userStats.streak > 0 && (
          <div className="mt-12 p-4 border border-border rounded-lg bg-card text-center">
            <div className="font-bold text-sm tracking-wider mb-1">
              {userStats.streak} DAY STREAK
            </div>
            <div className="text-xs text-muted-foreground">
              KEEP THE MOMENTUM GOING
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;