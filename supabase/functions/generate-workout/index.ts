import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { spaceSize, hasWeights, intensity, duration, focusArea, notes }: WorkoutRequest = await req.json();

    console.log('Generating workout with preferences:', { spaceSize, hasWeights, intensity, duration, focusArea, notes });

    const systemPrompt = `You are an expert personal trainer. Generate a personalized ${duration}-minute workout plan. Return ONLY valid JSON, no markdown or explanation.`;

    const userPrompt = `Create a ${duration}-minute workout with these requirements:
- Space: ${spaceSize} (${spaceSize === 'small' ? 'no jumping, stationary exercises only' : 'full movements allowed'})
- Equipment: ${hasWeights ? 'weights available' : 'bodyweight only'}
- Intensity: ${intensity}
- Focus: ${focusArea}
- User notes/limitations: ${notes || 'none'}

Structure:
- Warmup: 2-4 exercises (${Math.round(duration * 0.15)} min)
- Main: 4-8 exercises (${Math.round(duration * 0.7)} min)
- Cooldown: 2-3 exercises (${Math.round(duration * 0.15)} min)

Return this exact JSON format:
{
  "exercises": [
    {
      "id": "exercise-1",
      "name": "Exercise Name",
      "duration": 45,
      "reps": null,
      "sets": null,
      "instructions": "Clear step-by-step instructions.",
      "formTips": ["Safety tip", "Form tip", "Breathing tip"],
      "category": "warmup",
      "restAfter": 15
    }
  ],
  "totalDuration": ${duration * 60},
  "estimatedCalories": ${Math.round(duration * 8)}
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Clean and parse the JSON response
    let cleanedContent = content.trim();
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const workoutData = JSON.parse(cleanedContent);

    // Add unique IDs and ensure proper structure
    workoutData.exercises = workoutData.exercises.map((exercise: any, index: number) => ({
      ...exercise,
      id: `${focusArea}-${index + 1}`,
    }));

    console.log('Workout generated successfully with', workoutData.exercises.length, 'exercises');

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
