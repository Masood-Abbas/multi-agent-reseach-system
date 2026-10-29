import os
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import sys
from langchain_google_genai import ChatGoogleGenerativeAI
from pathlib import Path

# Add project root directory to sys.path so 'tool' can be imported regardless of execution directory
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from tool.tool import web_search, scrap_url

load_dotenv(ROOT_DIR / ".env")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash"
)

# create the 1st agent 
def build_serch_tool():
    prompt = (
        "You are an expert web research agent. When given a query, you MUST execute the web_search tool. "
        "In your final output, list all search results with their Titles, Snippets, and exact URLs without omitting any."
    )
    return create_agent(
        model=llm,
        tools=[web_search],
        system_prompt=prompt
    )

# create 2nd agents
def build_reader_agent():
    prompt = (
        "You are a web scraping and reading agent. Given search results containing URLs, you MUST use the scrap_url tool "
        "to scrape the top 2 to 3 most relevant URLs. Synthesize the findings and explicitly list each scraped URL with its key takeaways."
    )
    return create_agent(
        model=llm,
        tools=[scrap_url],
        system_prompt=prompt
    )

# writer prompt
writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research analyst and senior technical writer."),
    ("human", """Write an authoritative, rigorous, and comprehensive research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Guidelines:
1. Ground your report strictly in the provided research data. Do not invent unverified facts or timelines.
2. Structure the report clearly:
   - # [Title of the Report]
   - ## Introduction (Background and context of the topic)
   - ## Key Findings (At least 3-4 thoroughly analyzed points supported with concrete details and numbers from the research)
   - ## In-Depth Analysis & Practical Implications (Actionable takeaways or industry impact)
   - ## Conclusion (Summary of key takeaways and forward-looking outlook)
   - ## Sources (Explicitly cite each source with its Title and full URL from the gathered research)
3. Write with depth, factual accuracy, objective tone, and professional clarity."""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

# score and critic chain
critic_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an objective, balanced, and constructive research evaluator and editor.
Evaluate research reports fairly based on realistic criteria:
- Factual grounding and relevance to the prompt topic
- Clarity, structure, and professional readability
- Inclusion of actionable takeaways and verifiable source citations

Scoring Guidelines:
- 9-10/10: Exceptional report with comprehensive analysis, clear sections, and direct source citations.
- 7-8/10: Solid, informative report meeting all core requirements with good structure and relevant facts.
- 5-6/10: Acceptable report but lacks depth, has formatting flaws, or misses key context.
- Below 5/10: Reserved only for severely broken, off-topic, or completely uninformative drafts.

Do not penalize reports unfairly for relying on current web search summaries. Be encouraging while providing 2-3 genuine areas for improvement."""),
    ("human", """Review the research report below:

Report:
{report}

Respond strictly in this exact format:

Score: X/10

Strengths:
- [Strength 1]
- [Strength 2]
- [Strength 3]

Areas to Improve:
- [Improvement 1]
- [Improvement 2]

one line verdict:
[One concise summary sentence]"""),
])

critic_chain = critic_prompt | llm | StrOutputParser()
