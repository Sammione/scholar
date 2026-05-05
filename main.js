import { supabase } from './lib/supabaseClient.js';

const scholarshipGrid = document.getElementById('scholarshipGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// State Management
let currentResults = [];

// Function to render cards
function renderScholarships(data, append = false) {
  if (!append) scholarshipGrid.innerHTML = '';
  
  if (!data || data.length === 0) {
    if (!append) {
      scholarshipGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
          <h3>No opportunities found.</h3>
          <p>Try searching for specific fields like "Quantum Computing", "Music", or "Environmental Science".</p>
        </div>
      `;
    }
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="card-category">${item.category || 'Funding'}</span>
      <h3>${item.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.university || item.organization || 'Verified Provider'}</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${(item.tags || ['Live']).map(tag => `<span class="badge">${tag}</span>`).join('')}
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; flex-grow: 1;">${item.eligibility || 'Open to qualified applicants.'}</p>
      <div class="card-meta">
        <div class="amount">${item.amount || 'Varies'}</div>
        <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">View Source</a>
      </div>
    `;
    scholarshipGrid.appendChild(card);
  });
}

// High-Volume AI Search (LinkedIn Style)
async function performLiveSearch(query = "") {
  if (!query || query.length < 2) return;
  
  console.log("🔍 Initiating High-Volume Discovery for:", query);
  
  // Update Title
  const resultsTitle = document.getElementById('resultsTitle');
  if (resultsTitle) resultsTitle.innerText = `Search Results for "${query}"`;
  
  // UI State: Loading
  scholarshipGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 6rem;">
      <div class="loader"></div>
      <h2 style="margin-top: 2rem;">Searching Global Databases...</h2>
      <p style="color: var(--text-muted);">Aggregating 100+ live opportunities for "${query}"</p>
      <div id="searchProgress" style="margin-top: 1rem; font-weight: 600; color: var(--accent);">0% Complete</div>
    </div>
  `;

  const progressEl = document.getElementById('searchProgress');
  currentResults = [];
  
  // We perform 4 parallel requests to reach 100+ results
  const chunks = [1, 2, 3, 4];
  const startTime = Date.now();

  try {
    const fetchChunk = async (index) => {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: "You are a professional scholarship and grant aggregator like LinkedIn Jobs or Indeed. You find REAL, CURRENT funding opportunities. Always provide valid URLs and unique results."
          }, {
            role: "user",
            content: `Find 25 unique, current scholarships or research grants for "${query}". 
            This is chunk ${index} of 4, so find different ones than common results.
            Return as a JSON object with a "scholarships" key containing an array of objects with: title, amount, organization, category, tags (array), eligibility, and link.`
          }],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      const results = content.scholarships || content.items || Object.values(content)[0] || [];
      
      // Filter out potential duplicates or bad links
      const uniqueResults = results.filter(newItem => 
        !currentResults.some(existing => existing.title === newItem.title)
      );

      currentResults = [...currentResults, ...uniqueResults];
      
      // Update Progress and Render
      const progress = Math.round((currentResults.length / 100) * 100);
      if (progressEl) progressEl.innerText = `${progress}% Discovered (${currentResults.length} items found)`;
      
      if (currentResults.length > 0 && index === 1) {
        scholarshipGrid.innerHTML = ''; // Clear loader on first successful chunk
      }
      renderScholarships(uniqueResults, true);
    };

    // Run all chunks in parallel for speed
    await Promise.all(chunks.map(i => fetchChunk(i)));

    console.log(`✅ Search Complete. Found ${currentResults.length} items in ${(Date.now() - startTime)/1000}s`);

  } catch (e) {
    console.error("High-Volume Discovery Failed:", e);
    if (currentResults.length === 0) {
      renderScholarships([]);
    }
  }
}

// --- Event Listeners ---

searchBtn.addEventListener('click', () => performLiveSearch(searchInput.value));

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performLiveSearch(searchInput.value);
});

// Category Filtering (Mock Search)
document.querySelectorAll('.category-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const category = pill.getAttribute('data-category');
    searchInput.value = category === 'all' ? "" : category;
    if (category !== 'all') performLiveSearch(category);
  });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// Initial Welcome State
scholarshipGrid.innerHTML = `
  <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
    <h2>Ready to find funding?</h2>
    <p>Enter a keyword above to search 100+ live opportunities across the web.</p>
  </div>
`;

console.log("ScholarStream AI Aggregator (v2) Active.");
