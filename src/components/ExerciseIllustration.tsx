import React from 'react';

interface ExerciseIllustrationProps {
  exerciseName: string;
  className?: string;
}

const ExerciseIllustration = ({ exerciseName, className = "" }: ExerciseIllustrationProps) => {
  // Simple stick figure illustrations for common exercises
  const getIllustration = (name: string) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes('squat')) {
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
          {/* Squatting stick figure */}
          <circle cx="50" cy="15" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="23" x2="50" y2="55" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="35" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="65" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="55" x2="35" y2="75" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="55" x2="65" y2="75" stroke="currentColor" strokeWidth="3" />
          <line x1="35" y1="75" x2="30" y2="85" stroke="currentColor" strokeWidth="3" />
          <line x1="65" y1="75" x2="70" y2="85" stroke="currentColor" strokeWidth="3" />
          {/* Arrow showing movement */}
          <path d="M 20 60 L 20 70 L 17 67 M 20 70 L 23 67" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    }
    
    if (lowercaseName.includes('pushup') || lowercaseName.includes('push-up')) {
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
          {/* Push-up position stick figure */}
          <circle cx="20" cy="35" r="6" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <line x1="26" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="35" x2="25" y2="25" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="35" x2="25" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="60" y1="35" x2="65" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="70" y1="35" x2="75" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="25" y1="25" x2="20" y2="15" stroke="currentColor" strokeWidth="3" />
          <line x1="25" y1="45" x2="20" y2="55" stroke="currentColor" strokeWidth="3" />
          {/* Ground line */}
          <line x1="15" y1="55" x2="80" y2="55" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      );
    }
    
    if (lowercaseName.includes('plank')) {
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
          {/* Plank position stick figure */}
          <circle cx="20" cy="30" r="6" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <line x1="26" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="30" x2="25" y2="20" stroke="currentColor" strokeWidth="3" />
          <line x1="30" y1="30" x2="25" y2="40" stroke="currentColor" strokeWidth="3" />
          <line x1="60" y1="30" x2="65" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="70" y1="30" x2="75" y2="45" stroke="currentColor" strokeWidth="3" />
          <line x1="25" y1="20" x2="20" y2="10" stroke="currentColor" strokeWidth="3" />
          <line x1="25" y1="40" x2="20" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="65" y1="45" x2="60" y2="55" stroke="currentColor" strokeWidth="3" />
          <line x1="75" y1="45" x2="80" y2="55" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    }
    
    if (lowercaseName.includes('jumping') || lowercaseName.includes('jump')) {
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
          {/* Jumping stick figure */}
          <circle cx="50" cy="20" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="28" x2="50" y2="50" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="35" y2="25" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="35" x2="65" y2="25" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="50" x2="40" y2="65" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="50" x2="60" y2="65" stroke="currentColor" strokeWidth="3" />
          {/* Movement lines */}
          <path d="M 30 80 Q 50 70 70 80" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          <circle cx="50" cy="75" r="2" fill="currentColor" />
        </svg>
      );
    }
    
    if (lowercaseName.includes('stretch') || lowercaseName.includes('fold')) {
      return (
        <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
          {/* Stretching stick figure */}
          <circle cx="50" cy="70" r="6" fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="64" x2="50" y2="40" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="50" x2="35" y2="35" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="50" x2="65" y2="35" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="40" x2="45" y2="25" stroke="currentColor" strokeWidth="3" />
          <line x1="50" y1="40" x2="55" y2="25" stroke="currentColor" strokeWidth="3" />
          <line x1="45" y1="25" x2="40" y2="15" stroke="currentColor" strokeWidth="3" />
          <line x1="55" y1="25" x2="60" y2="15" stroke="currentColor" strokeWidth="3" />
        </svg>
      );
    }
    
    // Default generic exercise figure
    return (
      <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`}>
        {/* Standing stick figure */}
        <circle cx="50" cy="20" r="8" fill="currentColor" stroke="currentColor" strokeWidth="2" />
        <line x1="50" y1="28" x2="50" y2="60" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="40" x2="35" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="40" x2="65" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="60" x2="40" y2="80" stroke="currentColor" strokeWidth="3" />
        <line x1="50" y1="60" x2="60" y2="80" stroke="currentColor" strokeWidth="3" />
        <line x1="40" y1="80" x2="35" y2="90" stroke="currentColor" strokeWidth="3" />
        <line x1="60" y1="80" x2="65" y2="90" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  };

  return (
    <div className="w-24 h-24 text-white/60 flex items-center justify-center">
      {getIllustration(exerciseName)}
    </div>
  );
};

export default ExerciseIllustration;