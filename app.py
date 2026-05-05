import os
import asyncio
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

async def fetch_chunk(query, index):
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional scholarship and grant aggregator. Find REAL, CURRENT funding opportunities. Provide valid URLs."},
                {"role": "user", "content": f"Find 25 unique, current scholarships or research grants for '{query}'. This is chunk {index} of 4. Return as JSON with a 'scholarships' key."}
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
    
    # Run 4 parallel chunks to get ~100 results
    tasks = [fetch_chunk(request.query, i) for i in range(1, 5)]
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
    uvicorn.run(app, host="0.0.0.0", port=8000)
