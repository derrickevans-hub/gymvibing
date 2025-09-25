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

    const prompt = `Create a personalized ${duration}-minute workout plan with the following specifications:

WORKOUT REQUIREMENTS:
- Space: ${spaceSize} space ${spaceSize === 'small' ? '(apartment/office)' : '(gym/large room)'}
- Equipment: ${hasWeights ? 'Weights available' : 'Bodyweight only'}
- Intensity: ${intensity}
- Focus: ${focusArea}
- Duration: ${duration} minutes
- Special notes: ${notes || 'None'}

STRUCTURE REQUIRED:
1. Warmup (3-5 exercises, 5-8 minutes)
2. Main workout (4-6 exercises, ${duration - 12}-${duration - 8} minutes)
3. Cooldown (2-4 exercises, 3-5 minutes)

For each exercise, provide:
- Name (clear, descriptive)
- Duration (in seconds) OR reps/sets
- Detailed instructions (2-3 sentences)
- Form tips (3-4 bullet points for proper technique)
- Rest time after exercise (in seconds)

Return ONLY a valid JSON object in this exact format:
{
  "exercises": [
    {
      "id": "exercise-1",
      "name": "Exercise Name",
      "duration": 45,
      "reps": null,
      "sets": null,
      "instructions": "Clear step-by-step instructions for the exercise.",
      "formTips": [
        "Keep your core engaged",
        "Maintain proper posture",
        "Control the movement"
      ],
      "category": "warmup",
      "restAfter": 15
    }
  ],
  "totalDuration": ${duration * 60},
  "estimatedCalories": 150
}

Ensure:
- Total workout time matches ${duration} minutes
- Exercise difficulty matches ${intensity} intensity
- All exercises work for ${spaceSize} space
- ${hasWeights ? 'Include weight exercises' : 'Only bodyweight exercises'}
- Consider any limitations: ${notes}
- Include proper progression from warmup → main → cooldown`;

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