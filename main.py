from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import sys
import re
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.append(str(ROOT_DIR))

from agents.agent import build_serch_tool, build_reader_agent, writer_chain, critic_chain, chat_chain
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI(
    title="ResearchAI - Multi-Agent Research Assistant API",
    description="API to run autonomous multi-agent research pipelines for frontend integration.",
    version="1.0.0"
)

# Enable CORS for frontend applications (React, Next.js, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    topic: str = Field(..., example="Current petrol prices in Pakistan")

class SourceItem(BaseModel):
    title: str
    url: str
    content: Optional[str] = ""

class ReviewData(BaseModel):
    score: Optional[int] = None
    strengths: List[str] = []
    areas_to_improve: List[str] = []
    verdict: Optional[str] = ""
    raw: Optional[str] = ""

class ResearchResponse(BaseModel):
    topic: str
    report: str
    search_results: str
    scraped_content: str
    review: ReviewData
    sources: List[SourceItem]

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

def parse_critic_feedback(raw_feedback: str) -> ReviewData:
    """Parses standard critic output format into structured fields."""
    score = None
    strengths = []
    areas_to_improve = []
    verdict = ""

    score_match = re.search(r"Score:\s*(\d+)(?:/10)?", raw_feedback, re.IGNORECASE)
    if score_match:
        try:
            score = int(score_match.group(1))
        except ValueError:
            pass

    # Extract Strengths
    strengths_match = re.search(r"Strengths:\s*(.*?)(?=Areas to Improve:|one line verdict:|$)", raw_feedback, re.IGNORECASE | re.DOTALL)
    if strengths_match:
        lines = strengths_match.group(1).strip().splitlines()
        for line in lines:
            cleaned = re.sub(r"^[\s\-*•\d\.]+", "", line).strip()
            if cleaned:
                strengths.append(cleaned)

    # Extract Areas to Improve
    areas_match = re.search(r"Areas to Improve:\s*(.*?)(?=one line verdict:|$)", raw_feedback, re.IGNORECASE | re.DOTALL)
    if areas_match:
        lines = areas_match.group(1).strip().splitlines()
        for line in lines:
            cleaned = re.sub(r"^[\s\-*•\d\.]+", "", line).strip()
            if cleaned:
                areas_to_improve.append(cleaned)

    # Extract Verdict
    verdict_match = re.search(r"one line verdict:\s*(.*?)$", raw_feedback, re.IGNORECASE | re.DOTALL)
    if verdict_match:
        verdict = verdict_match.group(1).strip()

    return ReviewData(
        score=score,
        strengths=strengths,
        areas_to_improve=areas_to_improve,
        verdict=verdict,
        raw=raw_feedback
    )

def extract_sources_from_text(search_results: str) -> List[SourceItem]:
    """Extracts structured source items (Title, URL, Snippet) from search results."""
    sources: List[SourceItem] = []
    seen_urls = set()

    # Match Title : ... URL: ... Snippet : ... blocks
    blocks = re.split(r"-{4,}", search_results)
    for block in blocks:
        title_m = re.search(r"Title\s*:\s*(.*?)(?=\nURL|\n|$)", block, re.IGNORECASE)
        url_m = re.search(r"URL\s*:\s*(https?://[^\s]+)", block, re.IGNORECASE)
        snippet_m = re.search(r"Snippet\s*:\s*(.*?)(?=\nTitle|\nURL|$)", block, re.IGNORECASE | re.DOTALL)

        if url_m:
            url = url_m.group(1).strip()
            if url not in seen_urls:
                seen_urls.add(url)
                title = title_m.group(1).strip() if title_m else url
                content = snippet_m.group(1).strip() if snippet_m else ""
                sources.append(SourceItem(title=title, url=url, content=content))

    # Fallback regex if formatting differs
    if not sources:
        urls = re.findall(r"https?://[^\s)\]\"'>]+", search_results)
        for url in urls:
            cleaned_url = url.rstrip(".,;")
            if cleaned_url not in seen_urls:
                seen_urls.add(cleaned_url)
                sources.append(SourceItem(title=cleaned_url, url=cleaned_url, content=""))

    return sources

@app.get("/")
def health_check():
    return {"status": "ok", "message": "ResearchAI API is running"}

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

        # Parse structured review and sources
        review = parse_critic_feedback(feedback)
        sources = extract_sources_from_text(search_results)

        return ResearchResponse(
            topic=topic,
            report=report,
            search_results=search_results,
            scraped_content=scraped_content,
            review=review,
            sources=sources
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Research pipeline failed: {str(e)}")

# ---------------------------------------------------------------------------
# Conversational Memory Chat Endpoint
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    query: str
    research_context: Optional[str] = ""
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    answer: str

@app.post("/api/chat", response_model=ChatResponse)
def execute_chat(payload: ChatRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # Convert incoming chat history into LangChain messages
        messages = []
        for msg in payload.history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))

        # Append current user query
        messages.append(HumanMessage(content=query))

        # Run memory-aware chat chain
        answer = chat_chain.invoke({
            "research_context": payload.research_context,
            "messages": messages,
        })

        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat execution failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
