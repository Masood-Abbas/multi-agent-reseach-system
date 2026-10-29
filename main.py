from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import sys
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.append(str(ROOT_DIR))

from agents.agent import build_serch_tool, build_reader_agent, writer_chain, critic_chain

app = FastAPI(
    title="Multi-Agent Research Assistant API",
    description="API to run autonomous multi-agent research pipelines for frontend integration.",
    version="1.0.0"
)

# Enable CORS for frontend applications (React, Next.js, Vue, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend URL in production (e.g. ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    topic: str = Field(..., example="Latest developments in Artificial Intelligence in 2026")

class ResearchResponse(BaseModel):
    topic: str
    search_results: str
    scraped_content: str
    report: str
    feedback: str

def extract_message_content(message) -> str:
    """Helper to extract text whether content is a string or list of blocks."""
    content = message.content
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
            elif isinstance(part, str):
                text_parts.append(part)
        return "\n".join(text_parts)
    return str(content)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Multi-Agent Research API is running"}

@app.post("/api/research", response_model=ResearchResponse)
def execute_research(payload: ResearchRequest):
    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    try:
        # Step 1: Search Agent
        search_agent = build_serch_tool()
        search_result = search_agent.invoke({
            "messages": [("user", f"Search the web and find reliable information about: {topic}. You MUST use your web_search tool and return the exact URLs, Titles, and Snippets.")]
        })
        search_results = extract_message_content(search_result['messages'][-1])

        # Step 2: Reader Agent
        reader_agent = build_reader_agent()
        reader_result = reader_agent.invoke({
            "messages": [(
                "user",
                f"Here are the search results for '{topic}':\n\n{search_results}\n\n"
                f"Instructions:\n"
                f"1. Identify the top 2 to 3 distinct URLs from the search results.\n"
                f"2. Use the scrap_url tool to scrape EACH of those URLs.\n"
                f"3. Return the scraped summary, listing each URL and its key information."
            )]
        })
        scraped_content = extract_message_content(reader_result["messages"][-1])

        # Step 3: Writer Chain
        research_combined = (
            f"SEARCH RESULTS:\n{search_results}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{scraped_content}"
        )
        report = writer_chain.invoke({
            "topic": topic,
            "research": research_combined
        })

        # Step 4: Critic Chain
        feedback = critic_chain.invoke({
            "report": report
        })

        return ResearchResponse(
            topic=topic,
            search_results=search_results,
            scraped_content=scraped_content,
            report=report,
            feedback=feedback
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research pipeline failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

