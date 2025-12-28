import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins for CORS
const allowedOrigins = [
  'https://gfaorzadtmwcoyofxhvu.lovableproject.com',
  'https://8402f1f2-c79f-46b4-b711-1f6b23b0dd13.lovableproject.com',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.some(o => origin.startsWith(o.replace(/:\d+$/, ''))) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Input validation
interface WorkoutRequest {
  spaceSize: 'small' | 'big';
  hasWeights: boolean;
  intensity: 'light' | 'moderate' | 'intense';
  duration: number;
  focusArea: string;
  notes: string;
}

function validateInput(data: unknown): { valid: true; data: WorkoutRequest } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const req = data as Record<string, unknown>;

  // Validate spaceSize
  if (!['small', 'big'].includes(req.spaceSize as string)) {
    return { valid: false, error: 'spaceSize must be "small" or "big"' };
  }

  // Validate hasWeights
  if (typeof req.hasWeights !== 'boolean') {
    return { valid: false, error: 'hasWeights must be a boolean' };
  }

  // Validate intensity
  if (!['light', 'moderate', 'intense'].includes(req.intensity as string)) {
    return { valid: false, error: 'intensity must be "light", "moderate", or "intense"' };
  }

  // Validate duration (5-120 minutes)
  const duration = Number(req.duration);
  if (isNaN(duration) || duration < 5 || duration > 120) {
    return { valid: false, error: 'duration must be between 5 and 120 minutes' };
  }

  // Validate focusArea (max 50 chars, alphanumeric and hyphens only)
  const focusArea = String(req.focusArea || '').slice(0, 50);
  if (!/^[a-zA-Z0-9-]*$/.test(focusArea)) {
    return { valid: false, error: 'focusArea contains invalid characters' };
  }

  // Sanitize notes (max 500 chars, remove potential injection patterns)
  let notes = String(req.notes || '').slice(0, 500);
  // Remove patterns that could be prompt injection
  notes = notes.replace(/ignore\s+(previous|all|above)/gi, '')
               .replace(/system\s*:/gi, '')
               .replace(/assistant\s*:/gi, '')
               .replace(/user\s*:/gi, '')
               .trim();

  return {
    valid: true,
    data: {
      spaceSize: req.spaceSize as 'small' | 'big',
      hasWeights: req.hasWeights as boolean,
      intensity: req.intensity as 'light' | 'moderate' | 'intense',
      duration,
      focusArea: focusArea || 'full-body',
      notes,
    }
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(rawBody);
    
    if (!validation.valid) {
      console.error('Input validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid input', message: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { spaceSize, hasWeights, intensity, duration, focusArea, notes } = validation.data;

    console.log('Generating workout with validated preferences:', { spaceSize, hasWeights, intensity, duration, focusArea, notesLength: notes.length });

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
        headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
