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

// Search Logic
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  console.log("Searching for:", query);
  
  const filtered = allScholarships.filter(item => 
    (item.title && item.title.toLowerCase().includes(query)) || 
    (item.category && item.category.toLowerCase().includes(query)) || 
    (item.university && item.university.toLowerCase().includes(query)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) ||
    (item.eligibility && item.eligibility.toLowerCase().includes(query))
  );
  renderScholarships(filtered);
});

// Category Filtering
const categoryPills = document.querySelectorAll('.category-pill');

categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const category = pill.getAttribute('data-category');
    if (category === 'all') {
      renderScholarships(allScholarships);
    } else {
      const filtered = allScholarships.filter(item => 
        (item.category && item.category.toLowerCase().includes(category.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(category.toLowerCase()))
      );
      renderScholarships(filtered);
    }
    document.getElementById('discover').scrollIntoView({ behavior: 'smooth' });
  });
});

let allScholarships = scholarships; 

import { supabase } from './lib/supabaseClient.js';

// Function to load data from Supabase
async function loadData() {
  try {
    const { data: externalData, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('posted_date', { ascending: false });

    if (error) throw error;

    // Merge mock data and live database data
    allScholarships = [...scholarships, ...(externalData || [])];
    renderScholarships(allScholarships);
  } catch (e) {
    console.error("Supabase load error:", e.message);
    renderScholarships(scholarships);
  }
}

// Initial Render
loadData();

// Search Logic
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = scholarships.filter(item => 
    item.title.toLowerCase().includes(query) || 
    item.category.toLowerCase().includes(query) || 
    item.university.toLowerCase().includes(query) ||
    item.tags.some(tag => tag.toLowerCase().includes(query))
  );
  renderScholarships(filtered);
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
