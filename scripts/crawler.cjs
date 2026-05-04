const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { OpenAI } = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase (Using Service Role Key to bypass RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TARGET_SITES = [
  {
    name: "Computer Science Grants",
    url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/academic-major/computer-science",
    selectors: {
      item: "ul.scholarship-directory-list li",
      title: "a",
      amount: ".amount",
      deadline: ".deadline"
    }
  },
  {
    name: "Engineering Scholarships",
    url: "https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory/academic-major/engineering",
    selectors: {
      item: "ul.scholarship-directory-list li",
      title: "a",
      amount: ".amount",
      deadline: ".deadline"
    }
  }
];

async function processWithAI(rawList) {
  console.log("🤖 Asking AI to enrich and categorize data...");
  const prompt = `Clean this list and return a valid JSON array. Each object must have: title, amount, deadline, category, eligibility, tags (array), university, and link.
    Raw Data: ${JSON.stringify(rawList.slice(0, 10))}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content);
    return result.scholarships || result.items || Object.values(result)[0];
  } catch (error) {
    return rawList;
  }
}

async function crawl() {
  console.log("🚀 Starting Cloud-Powered Crawler...");
  
  for (const site of TARGET_SITES) {
    try {
      console.log(`\n🔍 Scraping: ${site.name}...`);
      const { data } = await axios.get(site.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(data);
      const siteResults = [];

      $(site.selectors.item).each((i, el) => {
        const title = $(el).find(site.selectors.title).text().trim();
        const link = $(el).find(site.selectors.title).attr('href');
        if (title) {
          siteResults.push({
            title,
            link: link.startsWith('http') ? link : `https://www.scholarships.com${link}`,
            amount: $(el).find(site.selectors.amount).text().trim(),
            deadline: $(el).find(site.selectors.deadline).text().trim(),
            source: site.name
          });
        }
      });

      const enrichedData = await processWithAI(siteResults);
      
      console.log(`💾 Saving ${enrichedData.length} items to Supabase...`);
      
      const { error } = await supabase
        .from('scholarships')
        .upsert(enrichedData.map(item => ({
          title: item.title,
          category: item.category,
          amount: item.amount,
          deadline: item.deadline,
          university: item.university,
          tags: item.tags,
          eligibility: item.eligibility,
          link: item.link
        })), { onConflict: 'title' });

      if (error) throw error;
      console.log("✅ Data synced with Supabase!");

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

crawl();
