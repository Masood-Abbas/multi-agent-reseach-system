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
    model="gemini-3.5-flash-lite"
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
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional."""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

# score and critic chain
critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
-...
-...
Areas to Improve:
-...
-...
one line verdict:
..."""),
])

critic_chain = critic_prompt | llm | StrOutputParser()
