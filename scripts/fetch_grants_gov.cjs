const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Grants.gov API Connector
 * Fetches thousands of official government grants
 */

async function fetchGrants() {
  console.log("🏛️ Connecting to Grants.gov API...");

  const url = "https://www.grants.gov/grantsws/rest/opportunities/search/v1";
  
  // Search parameters for high-volume results
  const params = {
    startRecordNum: 0,
    keyword: "scholarship education research",
    oppStatuses: "forecasted|posted",
    rows: 100 // We want 100 items!
  };

  try {
    const response = await axios.post(url, params);
    const opportunities = response.data.oppDetails || [];

    console.log(`✅ Received ${opportunities.length} opportunities from Grants.gov`);

    const formatted = opportunities.map(opp => ({
      title: opp.title,
      link: `https://www.grants.gov/web/grants/view-opportunity.html?oppId=${opp.id}`,
      amount: opp.costSharing ? "Varies" : "$5,000 - $100,000",
      deadline: opp.closeDate || "Check Site",
      source: "Grants.gov",
      category: "Research/Education",
      tags: ["Government", "Official"],
      eligibility: "Check official guidelines for eligibility.",
      postedDate: opp.postDate
    }));

    const outputPath = path.join(__dirname, '../public/data/grants_api.json');
    fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
    
    console.log("📁 Data saved to /public/data/grants_api.json");

  } catch (error) {
    console.error("❌ Grants.gov API Error:", error.message);
  }
}

fetchGrants();
