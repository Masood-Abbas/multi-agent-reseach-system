from agents.agent import build_serch_tool, build_reader_agent, writer_chain, critic_chain
from rich import print

def extract_message_content(message) -> str:
    """Helper to extract text whether content is a string or list of blocks (like in Gemini)."""
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

def run_research_pipeline(topic: str) -> dict:
    state = {}

    # Step 1: Search Agent
    print("\n" + " =" * 50)
    print("step 1 - search agent is working ... ")
    print("=" * 50)

    search_agent = build_serch_tool()
    search_result = search_agent.invoke({
        "messages": [("user", f"Search the web and find reliable information about: {topic}. You MUST use your web_search tool and return the exact URLs, Titles, and Snippets.")]
    })
    state["search_results"] = extract_message_content(search_result['messages'][-1])
    print("\nsearch result:\n", state['search_results'])

    # Step 2: Reader Agent
    print("\n" + " =" * 50)
    print("step 2 - build reader agent is working ... ")
    print("=" * 50)

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [(
            "user",
            f"Here are the search results for '{topic}':\n\n{state['search_results']}\n\n"
            f"Instructions:\n"
            f"1. Identify the top 2 to 3 distinct URLs from the search results.\n"
            f"2. Use the scrap_url tool to scrape EACH of those URLs.\n"
            f"3. Return the scraped summary, listing each URL and its key information."
        )]
    })
    state["scraped_content"] = extract_message_content(reader_result["messages"][-1])
    print("\nscraped content:\n", state['scraped_content'])

    # Step 3: Writer Chain
    print("\n" + " =" * 50)
    print("step 3 - create the final report ... ")
    print("=" * 50)

    reserch_combined = (
        f"SEARCH RESULTS:\n{state['search_results']}\n\n"
        f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
    )

    state["report"] = writer_chain.invoke({
        "topic": topic,
        "research": reserch_combined
    })
    print("\nFinal Report:\n", state['report'])

    # Step 4: Critic Chain
    print("\n" + " =" * 50)
    print("step 4 - critic is reviewing the report ... ")
    print("=" * 50)

    state['feedback'] = critic_chain.invoke({
        "report": state['report']
    })
    print("\ncritic Report:\n", state['feedback'])

    return state

if __name__ == "__main__":
    topic = input("\nEnter a research topic: ")
    run_research_pipeline(topic)
