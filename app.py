import os
import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(api_key=os.getenv("VITE_OPENAI_API_KEY"))

class SearchRequest(BaseModel):
    query: str

async def fetch_grants_gov(query: str):
    url = "https://api.grants.gov/v1/api/search2"
    payload = {
        "keyword": query,
        "oppStatuses": "posted",
        "rows": 10
    }
    try:
        async with httpx.AsyncClient(verify=False) as http_client:
            response = await http_client.post(url, json=payload, timeout=15.0)
            if response.status_code == 200:
                data = response.json()
                opps = data.get("oppHits", [])
                results = []
                for opp in opps:
                    results.append({
                        "title": opp.get("title", "Unknown Grant"),
                        "university": opp.get("agency", "Grants.gov"),
                        "category": "Federal Grant",
                        "tags": ["Grant", "Federal", "Verified"],
                        "eligibility": "Check Grants.gov for full eligibility requirements.",
                        "amount": "See Details",
                        "link": f"https://www.grants.gov/search-results-detail/{opp.get('id', '')}"
                    })
                return results
    except Exception as e:
        print(f"Error fetching from Grants.gov: {e}")
    return []

async def fetch_chunk(query, index):
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional scholarship and grant aggregator. Find REAL, CURRENT funding opportunities. Provide valid URLs."},
                {"role": "user", "content": f"Find 10 unique, current scholarships or research grants for '{query}'. This is chunk {index} of 2. Return as JSON with a 'scholarships' key. Include keys: title, university, category, tags (array), eligibility, amount, link."}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        import json
        return json.loads(response.choices[0].message.content).get("scholarships", [])
    except Exception as e:
        print(f"Error in chunk {index}: {e}")
        return []

@app.post("/search")
async def search(request: SearchRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    print(f"🔍 Searching for: {request.query}")
    
    # Run parallel: 2 chunks from AI + Real API call to Grants.gov
    tasks = [fetch_chunk(request.query, i) for i in range(1, 3)]
    tasks.append(fetch_grants_gov(request.query))
    
    results = await asyncio.gather(*tasks)
    
    # Flatten results and remove duplicates
    flat_results = [item for sublist in results for item in sublist]
    unique_results = []
    seen_titles = set()
    for item in flat_results:
        if item.get("title") not in seen_titles:
            unique_results.append(item)
            seen_titles.add(item.get("title"))
            
    return {"results": unique_results}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
