// Mock Data for Scholarships
const scholarships = [
  {
    id: 1,
    title: "Global Tech Innovation Grant 2026",
    category: "Technology",
    amount: "$25,000",
    deadline: "Oct 15, 2026",
    university: "Stanford University",
    tags: ["STEM", "International"],
    link: "https://stanford.edu"
  },
  {
    id: 2,
    title: "Eco-Future Research Scholarship",
    category: "Sustainability",
    amount: "$12,000",
    deadline: "Dec 01, 2026",
    university: "ETH Zurich",
    tags: ["Climate", "Masters"],
    link: "https://ethz.ch"
  },
  {
    id: 3,
    title: "Women in Leadership Foundation",
    category: "Leadership",
    amount: "$10,000",
    deadline: "Nov 20, 2026",
    university: "Harvard Business School",
    tags: ["Diversity", "MBA"],
    link: "https://hbs.edu"
  },
  {
    id: 4,
    title: "Artificial Intelligence Ethics Fellowship",
    category: "Artificial Intelligence",
    amount: "$40,000",
    deadline: "Jan 15, 2027",
    university: "MIT",
    tags: ["Ph.D", "Research"],
    link: "https://mit.edu"
  },
  {
    id: 5,
    title: "Creative Arts Breakthrough Award",
    category: "Arts & Humanities",
    amount: "$5,500",
    deadline: "Sep 30, 2026",
    university: "Royal College of Art",
    tags: ["Visual Arts", "Undergrad"],
    link: "https://rca.ac.uk"
  },
  {
    id: 6,
    title: "Digital Health Solutions Grant",
    category: "Medicine",
    amount: "$18,000",
    deadline: "Feb 10, 2027",
    university: "Oxford University",
    tags: ["HealthTech", "PostGrad"],
    link: "https://ox.ac.uk"
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

// Category Filtering
const categoryPills = document.querySelectorAll('.category-pill');

categoryPills.forEach(pill => {
  pill.addEventListener('click', () => {
    // UI Update
    categoryPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    // Filtering logic
    const category = pill.getAttribute('data-category');
    if (category === 'all') {
      renderScholarships(allScholarships);
    } else {
      const filtered = allScholarships.filter(item => 
        item.category.toLowerCase() === category.toLowerCase() ||
        (category === 'Arts & Humanities' && item.category === 'Arts')
      );
      renderScholarships(filtered);
    }
    
    // Scroll to results
    document.getElementById('discover').scrollIntoView({ behavior: 'smooth' });
  });
});

let allScholarships = scholarships; // Global storage for filtering

import { supabase } from './lib/supabaseClient.js';

// Function to load data from Supabase
async function loadData() {
  try {
    const { data: externalData, error } = await supabase
      .from('scholarships')
      .select('*')
      .order('posted_date', { ascending: false });

    if (error) throw error;

    allScholarships = [...scholarships, ...externalData];
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
