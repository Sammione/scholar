const scholarshipsGrid = document.getElementById('scholarshipsGrid');
const grantsGrid = document.getElementById('grantsGrid');
const searchInput = document.getElementById('advancedSearchInput');
const searchBtn = document.getElementById('advancedSearchBtn');
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const resultCount = document.getElementById('resultCount');

let currentResults = [];

function createCardHTML(item) {
    const isVerified = item.tags && item.tags.includes("Verified");
    const titleHtml = isVerified 
      ? `<h3>${item.title} <span style="color: #4ade80; font-size: 0.8em;" title="Verified Federal Grant">✓</span></h3>` 
      : `<h3>${item.title}</h3>`;

    return `
      <span class="card-category">${item.category || 'Funding'}</span>
      ${titleHtml}
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.university || item.organization || 'Verified Provider'}</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${(item.tags || ['Live']).map(tag => {
            const bg = tag === 'Verified' ? 'background: rgba(74, 222, 128, 0.1); color: #4ade80; border: 1px solid #4ade80;' : '';
            return `<span class="badge" style="${bg}">${tag}</span>`;
        }).join('')}
      </div>
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; flex-grow: 1;">${item.eligibility || 'Open to qualified applicants.'}</p>
      <div class="card-meta">
        <div class="amount" style="font-weight: 600; color: var(--accent);">${item.amount || 'Varies'}</div>
        <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">View Source</a>
      </div>
    `;
}

function renderScholarships(data) {
  scholarshipsGrid.innerHTML = '';
  grantsGrid.innerHTML = '';
  
  if (!data || data.length === 0) {
    const emptyMsg = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted); background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border);">
        <p>No opportunities found.</p>
      </div>
    `;
    scholarshipsGrid.innerHTML = emptyMsg;
    grantsGrid.innerHTML = emptyMsg;
    resultCount.innerText = "0 results found";
    return;
  }

  let scholarshipCount = 0;
  let grantCount = 0;

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = createCardHTML(item);
    
    // Sort into spaces based on category or title
    const cat = (item.category || "").toLowerCase();
    const title = (item.title || "").toLowerCase();
    
    if (cat.includes("grant") || title.includes("grant") || cat.includes("fellowship")) {
        grantsGrid.appendChild(card);
        grantCount++;
    } else {
        scholarshipsGrid.appendChild(card);
        scholarshipCount++;
    }
  });
  
  resultCount.innerText = `Showing ${scholarshipCount} Scholarships and ${grantCount} Grants`;
}

async function performSearch() {
  const query = searchInput.value.trim() || "grants and scholarships";
  
  const loadingMsg = `
    <div style="text-align: center; padding: 4rem;">
      <div class="loader"></div>
      <p style="color: var(--text-muted); margin-top: 1rem;">Fetching...</p>
    </div>
  `;
  scholarshipsGrid.innerHTML = loadingMsg;
  grantsGrid.innerHTML = loadingMsg;
  
  resultCount.innerText = "Searching global databases... This might take up to 20 seconds for a deep search.";

  try {
    const response = await fetch('http://localhost:8001/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    });

    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    currentResults = data.results || [];
    
    applyClientFilters(); // Apply side-bar filters immediately

  } catch (e) {
    console.error("Search Error:", e);
    renderScholarships([]);
    resultCount.innerText = "Error fetching results. Is the Python backend running?";
  }
}

function applyClientFilters() {
  // Get active checkboxes
  const activeTypes = Array.from(document.querySelectorAll('.type-filter:checked')).map(cb => cb.value.toLowerCase());
  
  // Filter logic (simple mock implementation for demonstration)
  const filtered = currentResults.filter(item => {
    // 1. Type Match (Check if category contains any of the selected types)
    const category = (item.category || "").toLowerCase();
    const matchesType = activeTypes.length === 0 || activeTypes.some(type => category.includes(type) || item.title.toLowerCase().includes(type));
    
    return matchesType;
  });

  renderScholarships(filtered);
}

// Event Listeners
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});
applyFiltersBtn.addEventListener('click', applyClientFilters);

// Run an initial search to populate the page
document.addEventListener('DOMContentLoaded', () => {
    performSearch();
});
