from agent import build_serch_tool,build_reader_agent,writer_chain,critic_chain

def run_research_pipeline(topic:str)->dict:
    state={}
    #search agent working
    print("\n"+" ="*50)
    print("step 1 - search agent is working ... ")
    print("="*50)

    search_agent=build_serch_tool()
    search_result=search_agent.invoke({
        "messages":[("user",f"Find recent ,reliable and detailed information about :{topic}")]
    })
    state["serch_results"]=search_result['messages'][-1].content 
    print("\n search result ", state['search_results'])

    # step 2
    print("\n"+" ="*50)
    print("step 2 - build reader agent is working ... ")
    print("="*50)

    reader_agent = build_reader_agent()
    reader_result=reader_agent. invoke({
    "messages": [("user",
    f"Based on the following search results about '{topic}', "
    f"pick the most relevant URL and scrape it for deeper content. \n\n"
    f"Search Results:\n{state['search_results' ] [: 800] }")]})
    state["scraped_content"]=reader_result["message"][-1].content

    print("\nscraped content\n", state['scraped_content'])

    # step 3
    print("\n"+" ="*50)
    print("step 3 - create the final report ... ")
    print("="*50)

    reserch_combined=(
        f"SEARCH RESULTS : \n {state['search_results' ]} \n\n"
        f"DETAILED SCRAPED CONTENT : \n {state['scraped_content' ]}"
     )

    state["report"]= writer_chain. invoke({
        "topic" : topic,
        "research" : reserch_combined
    })

    print("\nFinal Report \n",state['report'])

    # step 4
    print("\n"+" ="*50)
    print("step 4 - critic is reviewing the report  ... ")
    print("="*50)

    state['feedback']=critic_chain.invoke({
        "report":state['report']
    })

    print("\ncritic Report \n",state['feedback'])

    return state

if __name__ == "__main__":
    topic = input("\nEnter a research topic: ")
    run_research_pipeline(topic)