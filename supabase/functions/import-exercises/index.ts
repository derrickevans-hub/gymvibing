import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the CSV file
    const csvPath = new URL('./exercises.csv', import.meta.url).pathname;
    const csvContent = await Deno.readTextFile(csvPath);
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    console.log(`Processing ${dataLines.length} exercises...`);
    
    // Map difficulty to numeric values
    const difficultyMap: { [key: string]: number } = {
      'beginner': 1,
      'novice': 1,
      'intermediate': 2,
      'advanced': 3,
    };

    // Map body parts to standardized categories
    const bodyPartMap: { [key: string]: string } = {
      'biceps': 'upper',
      'triceps': 'upper',
      'chest': 'upper',
      'shoulders': 'upper',
      'back': 'upper',
      'lats': 'upper',
      'traps': 'upper',
      'forearms': 'upper',
      'quads': 'lower',
      'quadriceps': 'lower',
      'hamstrings': 'lower',
      'glutes': 'lower',
      'calves': 'lower',
      'legs': 'lower',
      'abdominals': 'core',
      'abs': 'core',
      'core': 'core',
      'obliques': 'core',
      'cardio': 'cardio',
      'full-body': 'full-body',
      'flexibility': 'flexibility',
    };

    // Map equipment to standardized categories
    const equipmentMap: { [key: string]: string } = {
      'barbell': 'weights',
      'dumbbells': 'weights',
      'dumbbell': 'weights',
      'kettlebell': 'weights',
      'cable': 'weights',
      'machine': 'weights',
      'bodyweight': 'none',
      'none': 'none',
      'chair': 'chair',
      'wall': 'wall',
      'resistance band': 'resistance-bands',
      'resistance bands': 'resistance-bands',
      'bands': 'resistance-bands',
    };

    const exercises = [];
    
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;
      
      // Parse CSV line (handle commas in quoted fields)
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 4) {
        console.warn(`Skipping malformed line ${i + 2}: ${line}`);
        continue;
      }
      
      const [name, equipment, difficulty, bodyPart] = parts;
      
      if (!name) {
        console.warn(`Skipping line ${i + 2}: missing exercise name`);
        continue;
      }
      
      const difficultyNum = difficultyMap[difficulty.toLowerCase()] || 2;
      const standardBodyPart = bodyPartMap[bodyPart.toLowerCase()] || 'full-body';
      const standardEquipment = equipmentMap[equipment.toLowerCase()] || 'none';
      
      exercises.push({
        name: name,
        difficulty: difficultyNum,
        body_part: standardBodyPart,
        equipment: standardEquipment,
        duration: 45, // default duration
        space_requirement: standardEquipment === 'none' ? 'minimal' : 'normal',
        energy_level: difficultyNum === 1 ? 'low' : difficultyNum === 2 ? 'medium' : 'high',
        instructions: `Perform ${name} with proper form. Focus on controlled movements.`,
        form_tips: ['Maintain proper posture', 'Control the movement', 'Breathe steadily'],
        category: 'main',
      });
    }

    console.log(`Prepared ${exercises.length} exercises for import`);

    // Insert in batches of 100 to avoid timeouts
    const batchSize = 100;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < exercises.length; i += batchSize) {
      const batch = exercises.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('exercises')
        .insert(batch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`Imported batch ${Math.floor(i / batchSize) + 1}: ${imported} total`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported,
        errors,
        total: exercises.length,
        message: `Successfully imported ${imported} exercises out of ${exercises.length}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
