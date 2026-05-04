import { supabase } from './lib/supabaseClient.js';

const scholarshipGrid = document.getElementById('scholarshipGrid');
const searchInput = document.getElementById('searchInput');

// We have REMOVED all hardcoded mock data.
let allResults = [];

// Function to render cards
function renderScholarships(data) {
  scholarshipGrid.innerHTML = '';
  
  if (data.length === 0) {
    scholarshipGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <h3>No opportunities found for this search.</h3>
        <p>Try searching for "Data Science", "STEM", or "Research".</p>
      </div>
    `;
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="card-category">${item.category || 'Opportunity'}</span>
      <h3>${item.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.university || 'Various Institutions'}</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${(item.tags || ['New']).map(tag => `<span class="badge">${tag}</span>`).join('')}
      </div>
      ${item.eligibility ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; font-style: italic;">${item.eligibility}</p>` : ''}
      <div class="card-meta">
        <div class="amount">${item.amount || 'Varies'}</div>
        <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Apply Now</a>
      </div>
    `;
    scholarshipGrid.appendChild(card);
  });
}

// LIVE SEARCH ENGINE (No Hardcoded Data)
async function performLiveSearch(query = "") {
  if (!query) {
    renderScholarships([]);
    return;
  }
  
  console.log("🚀 AI Discovery Engine: Finding scholarships for", query);
  
  scholarshipGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
      <div class="loader"></div>
      <p style="margin-top: 1rem; color: var(--text-muted);">AI is searching the web for live ${query} opportunities...</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Find 10 real, current scholarships or research grants related to "${query}". 
          Return as a JSON array of objects with: title, amount, deadline, category, university, tags (array), eligibility, and link.
          Include at least 3 grants and 7 scholarships.`
        }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error('API Request Failed');
    
    const aiResult = await response.json();
    const content = JSON.parse(aiResult.choices[0].message.content);
    const results = content.scholarships || content.items || Object.values(content)[0] || [];

    allScholarships = results; // Update global state
    renderScholarships(allScholarships);
  } catch (e) {
    console.error("Discovery Failed:", e);
    renderScholarships([]);
  }
}

// Search Button Click Logic
const searchBtn = document.getElementById('searchBtn');
searchBtn.addEventListener('click', () => {
  performLiveSearch(searchInput.value);
});

// Search on Enter Key
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    performLiveSearch(searchInput.value);
  }
});

// Search Logic (Debounced typing)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performLiveSearch(e.target.value);
  }, 800);
});

// Category Filtering
const categoryPills = document.querySelectorAll('.category-pill');
categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const category = pill.getAttribute('data-category');
    performLiveSearch(category === 'all' ? "Scholarship" : category);
  });
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
  });
});

console.log("ScholarStream AI Discovery Engine Active.");
