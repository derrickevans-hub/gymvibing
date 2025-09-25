import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Workout } from '@/types/exercise';
import WorkoutTimer from '@/components/WorkoutTimer';

interface WorkoutTimerState {
  workout: Workout;
}

const WorkoutTimerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as WorkoutTimerState;
  
  if (!state?.workout) {
    // Redirect back to home if no workout data
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const handleWorkoutComplete = () => {
    // Update user stats in localStorage
    const existingStats = JSON.parse(localStorage.getItem('vibe-gyming-stats') || '{"streak": 0, "totalWorkouts": 0, "totalMinutes": 0}');
    
    const today = new Date().toDateString();
    const lastWorkout = existingStats.lastWorkoutDate ? new Date(existingStats.lastWorkoutDate).toDateString() : null;
    
    let newStreak = existingStats.streak;
    if (lastWorkout === today) {
      // Already worked out today
    } else if (lastWorkout === new Date(Date.now() - 86400000).toDateString()) {
      newStreak = existingStats.streak + 1;
    } else {
      newStreak = 1;
    }

    const updatedStats = {
      streak: newStreak,
      totalWorkouts: existingStats.totalWorkouts + 1,
      totalMinutes: existingStats.totalMinutes + Math.round(state.workout.totalDuration / 60),
      lastWorkoutDate: new Date(),
    };

    localStorage.setItem('vibe-gyming-stats', JSON.stringify(updatedStats));
    
    // Navigate back to home
    navigate('/');
  };

  const handleExit = () => {
    navigate('/');
  };

  return (
    <WorkoutTimer
      exercises={state.workout.exercises}
      onComplete={handleWorkoutComplete}
      onExit={handleExit}
    />
  );
};

export default WorkoutTimerPage;