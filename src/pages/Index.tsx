import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-minimal';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { WorkoutPreferences, Workout, UserStats } from '@/types/exercise';
import { WorkoutGenerator } from '@/utils/workoutGenerator';
import WorkoutTimer from '@/components/WorkoutTimer';
import { 
  Zap, 
  Clock, 
  MapPin, 
  Dumbbell,
  Play,
  Settings,
  Target,
  Timer,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'customize' | 'workout'>('home');
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    totalWorkouts: 0,
    totalMinutes: 0,
  });

  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    timeMinutes: 3,
    spaceType: 'normal',
    energyLevel: 'medium',
    equipment: 'none',
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
      // Update streak logic
      const today = new Date().toDateString();
      const lastWorkout = userStats.lastWorkoutDate ? new Date(userStats.lastWorkoutDate).toDateString() : null;
      
      let newStreak = userStats.streak;
      if (lastWorkout === today) {
        // Already worked out today, don't change streak
      } else if (lastWorkout === new Date(Date.now() - 86400000).toDateString()) {
        // Worked out yesterday, increment streak
        newStreak = userStats.streak + 1;
      } else {
        // Reset streak
        newStreak = 1;
      }

      updateStats({
        streak: newStreak,
        totalWorkouts: userStats.totalWorkouts + 1,
        totalMinutes: userStats.totalMinutes + Math.round(workout.totalDuration / 60),
        lastWorkoutDate: new Date(),
      });
    }
    
    setCurrentView('home');
    setWorkout(null);
  };

  if (currentView === 'workout' && workout) {
    return (
      <WorkoutTimer
        exercises={workout.exercises}
        onComplete={handleWorkoutComplete}
        onExit={() => {
          setCurrentView('home');
          setWorkout(null);
        }}
      />
    );
  }

  if (currentView === 'customize') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-sm mx-auto px-4 py-8">
          {/* Clean header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('home')} 
              className="mb-6 -ml-2"
              size="sm"
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-semibold">Customize</h1>
            <p className="text-muted-foreground text-sm mt-1">Personalize your workout</p>
          </div>

          <div className="space-y-8">
            {/* Time Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Duration</h3>
              </div>
              
              <div className="space-y-4">
                <Slider
                  value={[preferences.timeMinutes]}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, timeMinutes: value[0] as 2 | 3 | 5 }))}
                  min={2}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="text-center">
                  <div className="text-3xl font-semibold text-primary">{preferences.timeMinutes}</div>
                  <div className="text-muted-foreground text-sm">minutes</div>
                </div>
              </div>
            </div>

            {/* Space Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Space</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'tight', label: 'Tight' },
                  { key: 'normal', label: 'Normal' },
                  { key: 'outdoor', label: 'Outdoor' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.spaceType === option.key ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => setPreferences(prev => ({ ...prev, spaceType: option.key as any }))}
                    className="h-12"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Energy</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'low', label: 'Low' },
                  { key: 'medium', label: 'Medium' },
                  { key: 'high', label: 'High' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.energyLevel === option.key ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => setPreferences(prev => ({ ...prev, energyLevel: option.key as any }))}
                    className="h-12"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-medium">Equipment</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'none', label: 'None' },
                  { key: 'chair', label: 'Chair' },
                  { key: 'wall', label: 'Wall' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.equipment === option.key ? 'primary' : 'outline'}
                    size="lg"
                    onClick={() => setPreferences(prev => ({ ...prev, equipment: option.key as any }))}
                    className="h-12"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              variant="floating"
              size="floating"
              onClick={generateWorkout}
              className="w-full mt-12"
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* Minimal header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">MicroFit</h1>
          <p className="text-muted-foreground text-sm">Quick workouts for busy schedules</p>
        </div>

        {/* Clean stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="stat-card hover-lift">
            <div className="text-2xl font-semibold mb-1">{userStats.streak}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Streak</div>
          </div>
          
          <div className="stat-card hover-lift">
            <div className="text-2xl font-semibold mb-1">{userStats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Sessions</div>
          </div>
          
          <div className="stat-card hover-lift">
            <div className="text-2xl font-semibold mb-1">{userStats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Minutes</div>
          </div>
        </div>

        {/* Main action */}
        <div className="mb-8">
          <Button
            variant="floating"
            size="floating"
            onClick={generateWorkout}
            className="w-full mb-4"
          >
            <Play className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <div className="font-medium mb-1">3-minute workout</div>
            <div className="text-sm text-muted-foreground">Medium intensity • No equipment</div>
          </div>
        </div>

        {/* Settings */}
        <div className="mb-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCurrentView('customize')}
            className="w-full"
          >
            <Settings className="w-4 h-4" />
            Customize
          </Button>
        </div>

        {/* Quick presets */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Options</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setPreferences({ timeMinutes: 2, spaceType: 'tight', energyLevel: 'low', equipment: 'chair' });
                generateWorkout();
              }}
              className="w-full text-left p-4 rounded-xl border border-border hover:bg-muted/30 transition-smooth"
            >
              <div className="font-medium mb-1">Desk Break</div>
              <div className="text-sm text-muted-foreground">2 min • Stretches</div>
            </button>
            
            <button
              onClick={() => {
                setPreferences({ timeMinutes: 3, spaceType: 'normal', energyLevel: 'high', equipment: 'none' });
                generateWorkout();
              }}
              className="w-full text-left p-4 rounded-xl border border-border hover:bg-muted/30 transition-smooth"
            >
              <div className="font-medium mb-1">Energy Boost</div>
              <div className="text-sm text-muted-foreground">3 min • Cardio</div>
            </button>
            
            <button
              onClick={() => {
                setPreferences({ timeMinutes: 5, spaceType: 'normal', energyLevel: 'low', equipment: 'none' });
                generateWorkout();
              }}
              className="w-full text-left p-4 rounded-xl border border-border hover:bg-muted/30 transition-smooth"
            >
              <div className="font-medium mb-1">Wind Down</div>
              <div className="text-sm text-muted-foreground">5 min • Movement</div>
            </button>
          </div>
        </div>

        {/* Streak encouragement */}
        {userStats.streak > 0 && (
          <div className="mt-12 p-4 bg-success/5 border border-success/20 rounded-xl">
            <div className="text-center">
              <div className="text-sm font-medium text-success mb-1">
                {userStats.streak} day streak
              </div>
              <div className="text-xs text-muted-foreground">
                Keep the momentum going
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;