import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkoutRequest {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  focusArea: string;
  notes: string;
}

interface Exercise {
  id: string;
  name: string;
  duration: number;
  reps?: number;
  sets?: number;
  instructions: string;
  formTips: string[];
  category: 'warmup' | 'main' | 'cooldown';
  restAfter?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    });

    const { spaceSize, hasWeights, intensity, duration, focusArea, notes }: WorkoutRequest = await req.json();

    const prompt = `You are an expert personal trainer with 15+ years of experience specializing in adaptive fitness, injury prevention, and personalized program design. Your mission is to analyze every detail of this user's profile and create a completely customized ${duration}-minute workout that is safe, effective, and perfectly suited to their unique situation.

## USER PROFILE ANALYSIS

**SPACE CONSTRAINTS:**
- Space: ${spaceSize} space
${spaceSize === 'small' ? `
  ⚠️ SMALL SPACE PROTOCOL ACTIVE:
  - NO jumping, hopping, or lateral movements
  - NO exercises requiring more than 6 feet of space
  - PRIORITIZE: Wall-supported moves, seated/lying exercises, stationary movements
  - FOCUS ON: Isometric holds, controlled movements, vertical exercises
` : `
  ✅ LARGE SPACE AVAILABLE:
  - Full dynamic movements permitted
  - Jumping, plyometrics, and lateral movements allowed
  - Multi-directional exercises encouraged
  - Explosive and traveling movements permitted
`}

**EQUIPMENT ASSESSMENT:**
- Equipment: ${hasWeights ? 'Weights available' : 'Bodyweight only'}
${hasWeights ? `
  🏋️ HYBRID TRAINING APPROACH:
  - Create progressive loading schemes
  - Combine weighted and bodyweight movements
  - Use weights for strength, bodyweight for conditioning
  - Include compound movements with resistance
` : `
  💪 OPTIMIZED CALISTHENICS:
  - Focus on movement quality and progression
  - Use leverage and tempo for intensity
  - Emphasize unilateral training
  - Include isometric challenges
`}

**INTENSITY MAPPING:**
- Target Intensity: ${intensity}
${intensity === 'light' ? `
  🌅 RECOVERY & ACTIVATION FOCUS:
  - Longer rest periods (45-90 seconds)
  - Gentle, flowing movements
  - Emphasis on mobility and activation
  - Heart rate: 50-65% max
  - Include breathing exercises and stretches
` : intensity === 'moderate' ? `
  ⚡ STEADY CHALLENGE PROTOCOL:
  - Moderate rest periods (30-60 seconds)
  - Balanced strength and cardio
  - Progressive difficulty
  - Heart rate: 65-80% max
  - Sustainable pace throughout
` : `
  🔥 HIGH INTENSITY PROTOCOL:
  - Short rest periods (15-45 seconds)
  - Compound, multi-joint movements
  - Elevated heart rate maintenance
  - Heart rate: 80-90% max
  - Maximum effort phases
`}

**FOCUS AREA EXPERTISE:**
- Primary Focus: ${focusArea}
${focusArea === 'upper-body' ? `
  🎯 UPPER BODY SPECIALIZATION:
  - Balance push/pull movements (1:1 ratio)
  - Include horizontal and vertical planes
  - Target all major muscle groups: chest, back, shoulders, arms
  - Emphasize posterior chain strengthening
` : focusArea === 'lower-body' ? `
  🎯 LOWER BODY SPECIALIZATION:
  - Emphasize unilateral (single-leg) work
  - Include all movement patterns: squat, hinge, lunge, step
  - Target glutes, quads, hamstrings, calves
  - Balance stability and power
` : focusArea === 'core' ? `
  🎯 CORE SPECIALIZATION:
  - Train all movement planes: sagittal, frontal, transverse
  - Include anti-extension, anti-flexion, anti-rotation
  - Progress from stable to unstable positions
  - Integrate core with full-body movements
` : focusArea === 'cardio' ? `
  🎯 CARDIOVASCULAR SPECIALIZATION:
  - Prioritize heart rate elevation and maintenance
  - Include interval training principles
  - Mix steady-state and high-intensity periods
  - Focus on metabolic conditioning
` : focusArea === 'mobility' ? `
  🎯 MOBILITY SPECIALIZATION:
  - Prioritize range of motion improvements
  - Include dynamic and static stretching
  - Target major joints and movement patterns
  - Emphasize controlled articular rotations
` : `
  🎯 FULL-BODY INTEGRATION:
  - Balance all movement patterns
  - Include upper, lower, and core integration
  - Vary movement planes and intensities
  - Create systemic training effect
`}

## INJURY INTELLIGENCE & SAFETY PROTOCOLS

**USER NOTES ANALYSIS:** "${notes || 'No specific limitations mentioned'}"

${notes ? `
⚠️ INJURY RISK ASSESSMENT ACTIVE:
- SCAN for keywords: back pain, knee issues, shoulder problems, neck pain, wrist pain, ankle issues, recent injury, surgery, arthritis, pregnancy, beginner, elderly
- If ANY injury keywords detected: AUTOMATICALLY exclude contraindicated exercises
- PRIORITIZE: Joint-friendly alternatives, supported movements, pain-free ranges
- INCLUDE: Specific form cues for injury prevention and modifications
- EMPHASIZE: "Stop if pain occurs" messaging in instructions
` : `
✅ NO SPECIFIC LIMITATIONS NOTED:
- Proceed with standard exercise selection
- Include general injury prevention form cues
- Maintain conservative progression for unknown fitness level
`}

## CONTEXTUAL WORKOUT ARCHITECTURE

**DURATION-BASED STRUCTURE:**
${duration <= 10 ? `
⏰ QUICK SESSION (${duration} min):
- Warmup: 2-3 exercises (2-3 minutes)
- Main: 2-4 exercises (${duration - 5}-${duration - 4} minutes)
- Cooldown: 1-2 exercises (1-2 minutes)
- FOCUS: High-impact movements, efficient compound exercises
` : duration <= 30 ? `
⏰ STANDARD SESSION (${duration} min):
- Warmup: 3-4 exercises (5-7 minutes)
- Main: 4-6 exercises (${duration - 12}-${duration - 8} minutes)
- Cooldown: 2-3 exercises (3-5 minutes)
- FOCUS: Balanced progression with adequate preparation
` : `
⏰ EXTENDED SESSION (${duration} min):
- Warmup: 4-5 exercises (8-10 minutes)
- Main: 6-8 exercises (${duration - 18}-${duration - 15} minutes)
- Cooldown: 3-4 exercises (5-8 minutes)
- FOCUS: Comprehensive training with full progression
`}

## EXERCISE SELECTION INTELLIGENCE

**WARMUP REQUIREMENTS:**
- Start with gentle mobility and activation
- Progress from small to large movements
- Include joint rotations and dynamic stretches
- Prepare specific areas for the main workout focus
- Match the intensity of upcoming exercises

**MAIN WORKOUT REQUIREMENTS:**
- Select exercises that honor ALL user constraints
- Create logical progression in difficulty
- Include the specified focus area as 60-70% of exercises
- Balance muscle groups and movement patterns
- Ensure exercises flow well together

**COOLDOWN REQUIREMENTS:**
- Gradually lower heart rate and intensity
- Include static stretches for worked muscles
- Promote recovery and flexibility
- End with calming, restorative movements

## PERSONALIZATION DEPTH

**EXPERIENCE ADAPTATION:**
- If "beginner" mentioned: Emphasize basic movements with extra detailed instructions
- If advanced terms used: Include more complex movement patterns
- Default: Assume intermediate level with clear, comprehensive instructions

**BREATHING & RECOVERY INTEGRATION:**
- Include breathing cues in high-intensity portions
- Specify rest periods based on intensity level
- Add recovery tips between challenging exercises
- Integrate mindfulness cues for cooldown

## CRITICAL OUTPUT REQUIREMENTS

Return ONLY a valid JSON object in this EXACT format:
{
  "exercises": [
    {
      "id": "exercise-1",
      "name": "Exercise Name",
      "duration": 45,
      "reps": null,
      "sets": null,
      "instructions": "Comprehensive step-by-step instructions adapted to user's profile and limitations.",
      "formTips": [
        "Safety-first form cue specific to user constraints",
        "Performance optimization tip",
        "Injury prevention guidance",
        "Breathing or tempo instruction"
      ],
      "category": "warmup",
      "restAfter": 15
    }
  ],
  "totalDuration": ${duration * 60},
  "estimatedCalories": 150
}

## FINAL VALIDATION CHECKLIST

Before generating, verify:
✅ Every exercise respects space constraints (${spaceSize} space)
✅ Equipment usage matches availability (${hasWeights ? 'weights included' : 'bodyweight only'})
✅ Intensity level appropriate (${intensity})
✅ Focus area emphasized (${focusArea})
✅ User limitations addressed (${notes || 'none specified'})
✅ Exercise progression flows logically
✅ Form tips include safety and performance elements
✅ Total duration matches ${duration} minutes exactly
✅ Rest periods appropriate for intensity level

Remember: This user's unique combination of factors should produce a fundamentally different workout than any other user. Analyze every detail and create something truly personalized.`;

    console.log('Calling Anthropic API with preferences:', { spaceSize, hasWeights, intensity, duration, focusArea, notes });
    
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    
    console.log('Anthropic API response received');

    // Extract text content from Claude's response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content received from Claude');
    }
    
    const content = textContent.text;
    
    // Parse the JSON response from Claude
    const workoutData = JSON.parse(content);
    
    // Add unique IDs and ensure proper structure
    workoutData.exercises = workoutData.exercises.map((exercise: any, index: number) => ({
      ...exercise,
      id: `${focusArea}-${index + 1}`,
    }));

    return new Response(
      JSON.stringify(workoutData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating workout:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate workout',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});