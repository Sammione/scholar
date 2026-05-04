require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function bootstrap() {
  console.log("🤖 Generating 50 high-quality scholarships using AI...");
  
  const prompt = `Generate a list of 20 diverse, real-world scholarships (Technology, Medicine, Arts, Business). 
  Return as a JSON array of objects with: title, amount, deadline, category, university, tags (array), eligibility, and link.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const scholarships = JSON.parse(response.choices[0].message.content).scholarships;
    
    console.log(`💾 Injecting ${scholarships.length} scholarships into Supabase...`);
    
    const { error } = await supabase.from('scholarships').upsert(scholarships, { onConflict: 'title' });
    if (error) throw error;

    console.log("✅ Success! Your Supabase database is now populated.");
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
}

bootstrap();
