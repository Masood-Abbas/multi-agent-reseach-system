import streamlit as st

from agents.agent import build_serch_tool, build_reader_agent, writer_chain, critic_chain
from app import extract_message_content

# ---------------------------------------------------------------------------
# Page setup
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Multi-Agent Research System",
    page_icon="🔎",
    layout="wide",
)

st.markdown(
    """
    <style>
    .block-container {padding-top: 2rem;}
    .step-caption {color: #888; font-size: 0.9rem;}
    </style>
    """,
    unsafe_allow_html=True,
)


def to_text(result) -> str:
    """Chain outputs may be plain strings or message objects."""
    if isinstance(result, str):
        return result
    if hasattr(result, "content"):
        return extract_message_content(result)
    return str(result)


# ---------------------------------------------------------------------------
# Session state
# ---------------------------------------------------------------------------
if "state" not in st.session_state:
    st.session_state.state = None
if "topic" not in st.session_state:
    st.session_state.topic = ""

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.title("🔎 Research Agents")
    st.markdown(
        """
        **Pipeline**
        1. 🌐 **Search Agent** – finds sources
        2. 📖 **Reader Agent** – scrapes top URLs
        3. ✍️ **Writer** – drafts the report
        4. 🧐 **Critic** – reviews the report
        """
    )
    st.divider()
    if st.button("🗑️ Clear results", use_container_width=True):
        st.session_state.state = None
        st.session_state.topic = ""
        st.rerun()

# ---------------------------------------------------------------------------
# Header + input
# ---------------------------------------------------------------------------
st.title("Multi-Agent Research System")
st.caption("Enter a topic and let the agents search, read, write and critique.")

with st.form("research_form", clear_on_submit=False):
    topic = st.text_input(
        "Research topic",
        placeholder="e.g. Impact of generative AI on software engineering jobs",
    )
    submitted = st.form_submit_button("🚀 Run research", type="primary")

# ---------------------------------------------------------------------------
# Run pipeline
# ---------------------------------------------------------------------------
if submitted:
    if not topic.strip():
        st.warning("Please enter a research topic first.")
    else:
        topic = topic.strip()
        state = {}

        try:
            with st.status("Running research pipeline...", expanded=True) as status:
                # Step 1: Search
                st.write("🌐 **Step 1 – Search agent is working...**")
                search_agent = build_serch_tool()
                search_result = search_agent.invoke({
                    "messages": [(
                        "user",
                        f"Search the web and find reliable information about: {topic}. "
                        f"You MUST use your web_search tool and return the exact URLs, Titles, and Snippets.",
                    )]
                })
                state["search_results"] = extract_message_content(search_result["messages"][-1])
                st.write("✅ Search complete")

                # Step 2: Reader
                st.write("📖 **Step 2 – Reader agent is scraping sources...**")
                reader_agent = build_reader_agent()
                reader_result = reader_agent.invoke({
                    "messages": [(
                        "user",
                        f"Here are the search results for '{topic}':\n\n{state['search_results']}\n\n"
                        f"Instructions:\n"
                        f"1. Identify the top 2 to 3 distinct URLs from the search results.\n"
                        f"2. Use the scrap_url tool to scrape EACH of those URLs.\n"
                        f"3. Return the scraped summary, listing each URL and its key information.",
                    )]
                })
                state["scraped_content"] = extract_message_content(reader_result["messages"][-1])
                st.write("✅ Scraping complete")

                # Step 3: Writer
                st.write("✍️ **Step 3 – Writer is creating the report...**")
                research_combined = (
                    f"SEARCH RESULTS:\n{state['search_results']}\n\n"
                    f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
                )
                state["report"] = to_text(writer_chain.invoke({
                    "topic": topic,
                    "research": research_combined,
                }))
                st.write("✅ Report drafted")

                # Step 4: Critic
                st.write("🧐 **Step 4 – Critic is reviewing the report...**")
                state["feedback"] = to_text(critic_chain.invoke({
                    "report": state["report"],
                }))
                st.write("✅ Review complete")

                status.update(label="Research complete!", state="complete", expanded=False)

            st.session_state.state = state
            st.session_state.topic = topic

        except Exception as e:
            st.error(f"Something went wrong while running the pipeline: {e}")

# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------
state = st.session_state.state
if state:
    st.divider()
    st.subheader(f"Results for: {st.session_state.topic}")

    tab_report, tab_feedback, tab_search, tab_scraped = st.tabs(
        ["📄 Final Report", "🧐 Critic Feedback", "🌐 Search Results", "📖 Scraped Content"]
    )

    with tab_report:
        st.markdown(state["report"])
        file_name = "_".join(st.session_state.topic.lower().split())[:50] or "report"
        st.download_button(
            "⬇️ Download report (.md)",
            data=state["report"],
            file_name=f"{file_name}.md",
            mime="text/markdown",
        )

    with tab_feedback:
        st.markdown(state["feedback"])

    with tab_search:
        st.markdown(state["search_results"])

    with tab_scraped:
        st.markdown(state["scraped_content"])