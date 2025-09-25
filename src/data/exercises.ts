import { Exercise } from '@/types/exercise';

export const exerciseDatabase: Exercise[] = [
  // Desk/Office Stretches
  {
    id: 'neck-rolls',
    name: 'Neck Rolls',
    duration: 30,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'Slowly roll your neck in circles, 5 times each direction'
  },
  {
    id: 'shoulder-shrugs',
    name: 'Shoulder Shrugs',
    duration: 30,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'Lift shoulders to ears, hold 2 seconds, release. Repeat 10 times'
  },
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    duration: 45,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'chair',
    instructions: 'Sit tall, twist gently to each side, hold 15 seconds'
  },
  
  // Bodyweight Strength
  {
    id: 'push-ups',
    name: 'Push-ups',
    duration: 45,
    reps: 10,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'medium',
    bodyFocus: 'upper',
    equipment: 'none',
    instructions: 'Standard or modified push-ups, maintain straight line'
  },
  {
    id: 'wall-push-ups',
    name: 'Wall Push-ups',
    duration: 30,
    reps: 15,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'upper',
    equipment: 'wall',
    instructions: 'Stand arms length from wall, push against wall'
  },
  {
    id: 'squats',
    name: 'Squats',
    duration: 45,
    reps: 15,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'medium',
    bodyFocus: 'lower',
    equipment: 'none',
    instructions: 'Feet shoulder-width apart, lower down like sitting in chair'
  },
  {
    id: 'chair-squats',
    name: 'Chair Squats',
    duration: 30,
    reps: 10,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'lower',
    equipment: 'chair',
    instructions: 'Stand up and sit down from chair without using hands'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    duration: 60,
    reps: 12,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'medium',
    bodyFocus: 'lower',
    equipment: 'none',
    instructions: 'Step forward, lower back knee toward ground, alternate legs'
  },

  // Cardio Bursts
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    duration: 30,
    reps: 20,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'high',
    bodyFocus: 'cardio',
    equipment: 'none',
    instructions: 'Jump feet apart while raising arms overhead, repeat quickly'
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    duration: 30,
    difficulty: 2,
    spaceRequirement: 'minimal',
    energyLevel: 'high',
    bodyFocus: 'cardio',
    equipment: 'none',
    instructions: 'March in place, bringing knees up to waist level'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    duration: 30,
    difficulty: 3,
    spaceRequirement: 'normal',
    energyLevel: 'high',
    bodyFocus: 'cardio',
    equipment: 'none',
    instructions: 'Plank position, alternate bringing knees to chest quickly'
  },
  {
    id: 'step-ups',
    name: 'Step-ups',
    duration: 45,
    reps: 16,
    difficulty: 2,
    spaceRequirement: 'minimal',
    energyLevel: 'medium',
    bodyFocus: 'cardio',
    equipment: 'chair',
    instructions: 'Step up onto chair, alternate legs, control the movement'
  },

  // Core Exercises
  {
    id: 'plank',
    name: 'Plank',
    duration: 30,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'medium',
    bodyFocus: 'core',
    equipment: 'none',
    instructions: 'Hold straight line from head to heels, engage core'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    duration: 45,
    reps: 12,
    difficulty: 2,
    spaceRequirement: 'normal',
    energyLevel: 'low',
    bodyFocus: 'core',
    equipment: 'none',
    instructions: 'Lie on back, extend opposite arm and leg, alternate slowly'
  },
  {
    id: 'seated-leg-lifts',
    name: 'Seated Leg Lifts',
    duration: 30,
    reps: 12,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'core',
    equipment: 'chair',
    instructions: 'Sit tall, lift one knee at a time, hold briefly'
  },

  // Flexibility
  {
    id: 'forward-fold',
    name: 'Forward Fold',
    duration: 30,
    difficulty: 1,
    spaceRequirement: 'normal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'Stand, slowly fold forward, let arms hang, gentle stretch'
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    duration: 45,
    difficulty: 1,
    spaceRequirement: 'normal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'On hands and knees, arch and round spine slowly'
  },
  {
    id: 'hip-circles',
    name: 'Hip Circles',
    duration: 30,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'Hands on hips, make large circles with your hips'
  },

  // Additional exercises for variety
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    duration: 30,
    reps: 20,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'lower',
    equipment: 'none',
    instructions: 'Rise up on toes, hold briefly, lower slowly'
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    duration: 30,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'flexibility',
    equipment: 'none',
    instructions: 'Extend arms, make small to large circles, both directions'
  },
  {
    id: 'desk-push-ups',
    name: 'Desk Push-ups',
    duration: 30,
    reps: 12,
    difficulty: 1,
    spaceRequirement: 'minimal',
    energyLevel: 'low',
    bodyFocus: 'upper',
    equipment: 'chair',
    instructions: 'Hands on desk edge, push-up at an angle'
  }
];