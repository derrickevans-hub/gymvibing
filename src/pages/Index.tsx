# Lovable Integration Prompt: Claude API + Workout Saving

## 1. Claude API Integration

**Add Anthropic Claude API integration to generate personalized workouts:**

### Install Dependencies:
```bash
npm install @anthropic-ai/sdk
```

### Environment Variables:
Add to your environment configuration:
```
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Create AI Service File (`src/services/aiService.ts`):
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage
});

export interface AIWorkoutRequest {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  focusArea: string;
  notes: string; // Add this for injuries/considerations
}

export interface AIExercise {
  name: string;
  sets: number;
  reps: string;
  duration: number;
  instructions: string[];
  restTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleGroups: string[];
}

export interface AIWorkoutResponse {
  title: string;
  totalDuration: number;
  exercises: AIExercise[];
  warmupAdvice: string;
  cooldownAdvice: string;
}

export const generateWorkoutWithAI = async (preferences: AIWorkoutRequest): Promise<AIWorkoutResponse> => {
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
      "reps": "10-12" or "30 seconds",
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
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{ 
        role: 'user', 
        content: prompt 
      }]
    });

    const content = response.content[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Generation Error:', error);
    // Fallback workout if API fails
    return {
      title: `${preferences.focusArea} Workout`,
      totalDuration: preferences.duration,
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: "8-12",
          duration: 60,
          instructions: [
            "Start in plank position with hands under shoulders",
            "Lower body until chest nearly touches ground",
            "Push back up to starting position"
          ],
          restTime: 30,
          difficulty: "beginner",
          muscleGroups: ["chest", "arms", "core"]
        }
      ],
      warmupAdvice: "Do light arm circles and body movements for 2-3 minutes",
      cooldownAdvice: "Stretch major muscle groups for 2-3 minutes"
    };
  }
};
```

## 2. Update Types File (`src/types/exercise.ts`):

Add these interfaces:
```typescript
export interface SavedWorkout {
  id: string;
  name: string;
  workout: AIWorkoutResponse;
  preferences: AIWorkoutRequest;
  savedAt: Date;
  timesCompleted: number;
}

// Update existing Workout interface to match AI response
export interface Workout extends AIWorkoutResponse {}
```

## 3. Enhanced Main Component Updates:

Replace the workout generation logic in your main component with:

```typescript
// Add these imports
import { generateWorkoutWithAI, AIWorkoutResponse } from '@/services/aiService';
import type { SavedWorkout } from '@/types/exercise';

// Add to state
const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
const [isGenerating, setIsGenerating] = useState(false);
const [showSavedWorkouts, setShowSavedWorkouts] = useState(false);

// Update generateWorkout function
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
    
    const aiWorkout = await generateWorkoutWithAI(aiRequest);
    setWorkout(aiWorkout);
    setCurrentView('workout');
  } catch (error) {
    console.error('Failed to generate workout:', error);
    // Could show error message to user here
  } finally {
    setIsGenerating(false);
  }
};

// Add save workout function
const saveCurrentWorkout = () => {
  if (!workout) return;
  
  const savedWorkout: SavedWorkout = {
    id: Date.now().toString(),
    name: workout.title || `${preferences.focusArea} - ${preferences.duration}min`,
    workout: workout,
    preferences: {
      spaceSize: preferences.spaceSize,
      hasWeights: preferences.hasWeights,
      intensity: preferences.intensity,
      duration: preferences.duration,
      focusArea: preferences.focusArea,
    },
    savedAt: new Date(),
    timesCompleted: 0
  };
  
  const updated = [...savedWorkouts, savedWorkout];
  setSavedWorkouts(updated);
  localStorage.setItem('vibe-gyming-saved', JSON.stringify(updated));
};

// Load saved workouts
useEffect(() => {
  const saved = localStorage.getItem('vibe-gyming-saved');
  if (saved) {
    setSavedWorkouts(JSON.parse(saved));
  }
}, []);

// Function to load a saved workout
const loadSavedWorkout = (savedWorkout: SavedWorkout) => {
  setWorkout(savedWorkout.workout);
  setPreferences(savedWorkout.preferences);
  setCurrentView('workout');
  
  // Update completion count
  const updated = savedWorkouts.map(sw => 
    sw.id === savedWorkout.id 
      ? { ...sw, timesCompleted: sw.timesCompleted + 1 }
      : sw
  );
  setSavedWorkouts(updated);
  localStorage.setItem('vibe-gyming-saved', JSON.stringify(updated));
};

// Function to delete saved workout
const deleteSavedWorkout = (workoutId: string) => {
  const updated = savedWorkouts.filter(sw => sw.id !== workoutId);
  setSavedWorkouts(updated);
  localStorage.setItem('vibe-gyming-saved', JSON.stringify(updated));
};
```

## 4. Add Saved Workouts View:

Add this view to your component's render logic:

```typescript
// Add this view after the questionnaire view
if (currentView === 'saved') {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 hover:bg-white/10 rounded transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-wider mb-2">SAVED WORKOUTS</h1>
          <p className="text-white/60 text-sm">Your favorite routines</p>
        </div>

        {/* Saved workouts list */}
        <div className="space-y-4">
          {savedWorkouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/50 mb-4">No saved workouts yet</p>
              <button
                onClick={() => setCurrentView('home')}
                className="px-6 py-2 border border-white/30 rounded-lg hover:bg-white/5 transition-colors"
              >
                CREATE YOUR FIRST WORKOUT
              </button>
            </div>
          ) : (
            savedWorkouts.map((saved) => (
              <div key={saved.id} className="border border-white/20 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-sm tracking-wider mb-1">{saved.name}</h3>
                    <p className="text-white/50 text-xs">
                      {saved.workout.exercises.length} exercises • {saved.workout.totalDuration} min
                    </p>
                    <p className="text-white/50 text-xs">
                      Completed {saved.timesCompleted} times
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSavedWorkout(saved.id)}
                    className="text-white/40 hover:text-white/80 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <button
                  onClick={() => loadSavedWorkout(saved)}
                  className="w-full py-2 border border-white/30 rounded hover:bg-white/5 transition-colors text-sm font-medium"
                >
                  START WORKOUT
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

## 5. Update Home Screen:

Add saved workouts button and loading state to main CTA:

```typescript
// In the home screen, add after stats section:
<div className="mb-8">
  <button
    onClick={() => setCurrentView('saved')}
    className="w-full py-3 border border-white/20 rounded-lg hover:bg-white/5 transition-colors mb-4"
  >
    <div className="font-bold text-sm tracking-wider mb-1">SAVED WORKOUTS</div>
    <div className="text-xs text-white/50">{savedWorkouts.length} routines saved</div>
  </button>
</div>

// Update the main CTA button:
<button
  onClick={startQuestionnaire}
  disabled={isGenerating}
  className="w-full h-16 bg-white text-black font-bold text-lg tracking-wider rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
>
  {isGenerating ? (
    <>Loading...</>
  ) : (
    <>
      <Play className="w-6 h-6" />
      START NEW WORKOUT
    </>
  )}
</button>
```

## 6. Update WorkoutTimer Component:

Add save workout button to the workout timer component:

```typescript
// Add to WorkoutTimer props
interface WorkoutTimerProps {
  exercises: AIExercise[];
  onComplete: () => void;
  onExit: () => void;
  onSaveWorkout?: () => void; // Add this
}

// In WorkoutTimer render, add save button:
<button
  onClick={onSaveWorkout}
  className="px-4 py-2 border border-white/30 rounded hover:bg-white/5 transition-colors text-sm"
>
  SAVE WORKOUT
</button>
```

## Implementation Notes:

1. **API Key Security**: In production, move the API calls to a backend service
2. **Error Handling**: The code includes fallback workouts if AI fails
3. **Local Storage**: Saves workouts locally for offline access
4. **Loading States**: Shows loading during AI generation
5. **Workout Stats**: Tracks how many times each saved workout is completed

This integration will give you AI-powered workout generation with the ability to save and replay favorite routines!