import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button-minimal';
import WorkoutTimer from '@/components/WorkoutTimer';
import { Workout, WorkoutPreferences } from '@/types/exercise';
import { WorkoutGenerator } from '@/utils/workoutGenerator';
import { Play } from 'lucide-react';

// Minimal, modern home + workout flow
const Index: React.FC = () => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [view, setView] = useState<'home' | 'workout'>('home');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.title = 'MicroFit – Minimal Workout Generator';
  }, []);

  const startQuickWorkout = () => {
    setIsGenerating(true);
    try {
      const preferences: WorkoutPreferences = {
        timeMinutes: 5,
        spaceType: 'normal',
        energyLevel: 'medium',
        equipment: 'none',
      };
      const w = WorkoutGenerator.generateWorkout(preferences);
      setWorkout(w);
      setView('workout');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    // For now, just return to home. Could add stats/toast later.
    setView('home');
    setWorkout(null);
  };

  const handleExit = () => {
    setView('home');
    setWorkout(null);
  };

  if (view === 'workout' && workout) {
    return (
      <WorkoutTimer
        exercises={workout.exercises}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );
  }

  // Home view
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-sm mx-auto px-4 py-10">
        <header className="pt-10 pb-8 text-center">
          <div className="text-4xl">⚡</div>
          <h1 className="text-2xl font-semibold mt-3">MicroFit</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tiny workouts, anywhere. No equipment required.
          </p>
        </header>

        <div className="rounded-xl border border-border bg-card text-card-foreground p-5">
          <div className="space-y-2 mb-6">
            <h2 className="text-base font-medium">Quick Start</h2>
            <p className="text-sm text-muted-foreground">
              5-minute routine • balanced mix • no equipment
            </p>
          </div>

          <Button
            variant="primary"
            size="xl"
            className="w-full"
            onClick={startQuickWorkout}
            disabled={isGenerating}
          >
            <Play className="w-5 h-5" />
            {isGenerating ? 'Preparing…' : 'Start Workout'}
          </Button>
        </div>

        <footer className="text-center mt-10 text-xs text-muted-foreground">
          Stay consistent. Progress follows.
        </footer>
      </section>
    </main>
  );
};

export default Index;
