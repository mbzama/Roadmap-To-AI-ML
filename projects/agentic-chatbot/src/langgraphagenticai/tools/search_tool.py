from langchain_community.tools import TavilySearchResults
from langgraph.prebuilt import ToolNode

def get_tools():
    """
    Returns a list of tools for the LangGraph AgenticAI application.
    Currently, it includes a web search tool using TavilySearchResults.
    
    Returns:
        list: A list containing the web search tool.
    """
    # Initialize the TavilySearchResults tool with the API key
    tavily_search_tool = TavilySearchResults(
        name="web_search",
        description="A tool to search the web for information.",
        max_results=2
    )
    
    return [tavily_search_tool]  # Return the list of tools

def create_search_tool(tools):
    """
    Creates and returns a search tool for the LangGraph AgenticAI application.
    
    Returns:
        ToolNode: A ToolNode instance for web search functionality.
    """
    return ToolNode(tools=tools)