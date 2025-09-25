import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button-enhanced';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { WorkoutPreferences, Workout, UserStats } from '@/types/exercise';
import { WorkoutGenerator } from '@/utils/workoutGenerator';
import WorkoutTimer from '@/components/WorkoutTimer';
import { 
  Zap, 
  Clock, 
  MapPin, 
  Dumbbell,
  Play,
  Calendar,
  Flame,
  Target,
  Settings
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setCurrentView('home')} className="mb-4">
              ← Back
            </Button>
            <h2 className="text-2xl font-bold text-center">Customize Workout</h2>
          </div>

          <div className="space-y-6">
            {/* Time Selection */}
            <Card className="workout-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Workout Duration
              </h3>
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
                  <span className="text-3xl font-bold text-primary">{preferences.timeMinutes}</span>
                  <span className="text-muted-foreground ml-1">minutes</span>
                </div>
              </div>
            </Card>

            {/* Space Type */}
            <Card className="workout-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Available Space
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'tight', label: 'Tight Space' },
                  { key: 'normal', label: 'Normal Room' },
                  { key: 'outdoor', label: 'Outdoor' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.spaceType === option.key ? 'hero' : 'gentle'}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, spaceType: option.key as any }))}
                    className="h-16 text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Energy Level */}
            <Card className="workout-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Energy Level
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'low', label: 'Low', icon: '😌' },
                  { key: 'medium', label: 'Medium', icon: '💪' },
                  { key: 'high', label: 'High', icon: '⚡' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.energyLevel === option.key ? 'hero' : 'gentle'}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, energyLevel: option.key as any }))}
                    className="h-16 text-xs flex-col gap-1"
                  >
                    <span className="text-lg">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Equipment */}
            <Card className="workout-card">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                Equipment Available
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'none', label: 'None', icon: '🚫' },
                  { key: 'chair', label: 'Chair', icon: '🪑' },
                  { key: 'wall', label: 'Wall', icon: '🧱' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={preferences.equipment === option.key ? 'hero' : 'gentle'}
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, equipment: option.key as any }))}
                    className="h-16 text-xs flex-col gap-1"
                  >
                    <span className="text-lg">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              variant="hero"
              size="xl"
              onClick={generateWorkout}
              className="w-full"
            >
              <Play className="w-5 h-5" />
              Generate Workout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="animate-slide-up">
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
              MicroFit
            </h1>
            <p className="text-muted-foreground">AI-powered micro workouts for busy lives</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="workout-card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl font-bold text-primary">{userStats.streak}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Flame className="w-3 h-3" />
              Day Streak
            </div>
          </Card>
          
          <Card className="workout-card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl font-bold text-success">{userStats.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Workouts
            </div>
          </Card>
          
          <Card className="workout-card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-2xl font-bold text-accent">{userStats.totalMinutes}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Minutes
            </div>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
          <Button
            variant="hero"
            size="xl"
            onClick={generateWorkout}
            className="w-full h-20 text-lg"
          >
            <div className="flex flex-col items-center gap-1">
              <Play className="w-8 h-8" />
              <span>Generate 3-Min Workout</span>
              <span className="text-sm opacity-80">Medium intensity • No equipment</span>
            </div>
          </Button>
        </div>

        {/* Customize Button */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <Button
            variant="gentle"
            size="lg"
            onClick={() => setCurrentView('customize')}
            className="w-full"
          >
            <Settings className="w-5 h-5" />
            Customize Workout
          </Button>
        </div>

        {/* Quick Modes */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-lg font-semibold">Quick Modes</h3>
          
          <Card className="workout-card">
            <Button
              variant="ghost"
              onClick={() => {
                setPreferences({ timeMinutes: 2, spaceType: 'tight', energyLevel: 'low', equipment: 'chair' });
                generateWorkout();
              }}
              className="w-full justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-semibold">Desk Break</div>
                <div className="text-sm text-muted-foreground">2-min stretches • Chair friendly</div>
              </div>
            </Button>
          </Card>
          
          <Card className="workout-card">
            <Button
              variant="ghost"
              onClick={() => {
                setPreferences({ timeMinutes: 3, spaceType: 'normal', energyLevel: 'high', equipment: 'none' });
                generateWorkout();
              }}
              className="w-full justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-semibold">Energy Boost</div>
                <div className="text-sm text-muted-foreground">3-min cardio burst • Get energized</div>
              </div>
            </Button>
          </Card>
          
          <Card className="workout-card">
            <Button
              variant="ghost"
              onClick={() => {
                setPreferences({ timeMinutes: 5, spaceType: 'normal', energyLevel: 'low', equipment: 'none' });
                generateWorkout();
              }}
              className="w-full justify-start h-auto p-4"
            >
              <div className="text-left">
                <div className="font-semibold">Evening Wind-down</div>
                <div className="text-sm text-muted-foreground">5-min gentle movement • Relax</div>
              </div>
            </Button>
          </Card>
        </div>

        {/* Motivational Message */}
        {userStats.streak > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-success/10 to-primary/10 rounded-xl border border-success/20 animate-slide-up">
            <div className="text-center">
              <div className="text-sm font-medium text-success">
                🔥 Amazing! {userStats.streak} day streak!
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Keep the momentum going with another quick workout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;