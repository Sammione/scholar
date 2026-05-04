// Mock Data for Scholarships
const scholarships = [
  {
    id: 1,
    title: "Global Tech Innovation Grant 2026",
    category: "Grant",
    amount: "$25,000",
    deadline: "Oct 15, 2026",
    university: "Stanford Research",
    tags: ["Research", "Tech"],
    link: "https://stanford.edu",
    eligibility: "Open to graduate researchers in computer science."
  },
  {
    id: 2,
    title: "Eco-Future Sustainability Scholarship",
    category: "Scholarship",
    amount: "$12,000",
    deadline: "Dec 01, 2026",
    university: "ETH Zurich",
    tags: ["Climate", "Masters"],
    link: "https://ethz.ch",
    eligibility: "Undergraduate students with a focus on renewable energy."
  },
  {
    id: 3,
    title: "National Health Research Grant",
    category: "Grant",
    amount: "$50,000",
    deadline: "Nov 20, 2026",
    university: "NIH",
    tags: ["Medicine", "Public Health"],
    link: "https://nih.gov",
    eligibility: "Post-doctoral researchers and medical students."
  }
];

const scholarshipGrid = document.getElementById('scholarshipGrid');
const searchInput = document.getElementById('searchInput');

// Function to render cards
function renderScholarships(data) {
  scholarshipGrid.innerHTML = '';
  
  if (data.length === 0) {
    scholarshipGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
        <h3>No scholarships found matching your search.</h3>
        <p>Try searching for "Technology" or "MIT".</p>
      </div>
    `;
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="card-category">${item.category}</span>
      <h3>${item.title}</h3>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${item.university}</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${item.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
      </div>
      ${item.eligibility ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; font-style: italic;">${item.eligibility}</p>` : ''}
      <div class="card-meta">
        <div class="amount">${item.amount}</div>
        <a href="${item.link || '#'}" target="_blank" class="btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Apply Now</a>
      </div>
    `;
    scholarshipGrid.appendChild(card);
  });
}

// Live Search Aggregator Logic
async function performLiveSearch(query = "") {
  console.log("🔍 Performing Live Search for:", query);
  
  // Show a loading state in the UI
  scholarshipGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
      <div class="loader"></div>
      <p style="margin-top: 1rem; color: var(--text-muted);">Searching live scholarship & grant platforms...</p>
    </div>
  `;

  try {
    // In a real production app, this would call your Backend Proxy
    // For now, we will aggregate from multiple public endpoints and our AI engine
    
    const [mockResults, apiResults] = await Promise.all([
      // Our internal curated list
      Promise.resolve(scholarships.filter(s => s.title.toLowerCase().includes(query.toLowerCase()))),
      // Official Government Grants API (Simulated live call)
      fetchGrantsGovLive(query)
    ]);

    const allResults = [...mockResults, ...apiResults];
    renderScholarships(allScholarships = allResults);
  } catch (e) {
    console.error("Live Search Failed:", e);
    renderScholarships(scholarships);
  }
}

// Simulated Live API Call (Grants.gov / Education API)
async function fetchGrantsGovLive(query) {
  // This mimics a real-time call to an external funding API
  // In production, you would point this to your Render/Vercel proxy
  return [
    {
      id: `live-1`,
      title: `${query || 'Education'} Research Grant 2026`,
      category: "Grant",
      amount: "$50,000",
      deadline: "Aug 2026",
      university: "National Science Foundation",
      tags: ["Research", "Official"],
      link: "https://grants.gov",
      eligibility: "Available for post-grad research projects."
    }
  ];
}

// Initial Load
performLiveSearch();

// Search Logic (Debounced for performance)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performLiveSearch(e.target.value);
  }, 500);
});

// Category Filtering
const categoryPills = document.querySelectorAll('.category-pill');
categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const category = pill.getAttribute('data-category');
    performLiveSearch(category === 'all' ? "" : category);
    document.getElementById('discover').scrollIntoView({ behavior: 'smooth' });
  });
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

console.log("ScholarStream logic initialized.");
