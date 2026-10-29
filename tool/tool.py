import requests
import os
from dotenv import load_dotenv
from langchain_core.tools import tool
from tavily import TavilyClient
from bs4 import BeautifulSoup
from rich import print

from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env")



@tool
def web_search(query: str)-> str:
    """Search the web for recent and reliable information on a topic. Return the Titles,URLs and snippts """
    TAVILY_API_KEY=os.getenv("TAVILY_API_KEY")
    tavily=TavilyClient(TAVILY_API_KEY)

    try:
        results=tavily.search(query=query,max_results=5)
        result_data=[]
        for r in results["results"]:
            result_data.append(f"Title : {r['title']} \nURL: {r["url"]} \n Snippet :{r['content'] [: 300] } \n")
        return "\n------\n".join(result_data)


    except Exception as e:
        return f" web search failed : {e}"

# searchResult=web_search.invoke("Today petrol price in pakistan ")
# print(searchResult)


@tool
def scrap_url(url:str)->str:
    """Scrape and return clean text content from a given url for deeper reading"""
    try:
        res=requests.get(url,timeout=8,headers={"USER-AGENT": "Mozilla/5.0"})
        soup=BeautifulSoup(res.text,"html.parser")
        for tag in soup(["script","style","header","footer"]):
            tag.decompose()
        return soup.get_text(separator=" ",strip=True)[:1500]
    except Exception as e:
         return f" Could not scrap URL : {e}"

# print(scrap_url.invoke("https://psopk.com/en/fuels/fuel-prices"))