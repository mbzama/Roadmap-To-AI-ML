from langgraph.graph import StateGraph
from src.langgraphagenticai.state.state import State
from langgraph.graph import START,END
from src.langgraphagenticai.nodes.basic_chatbot_node import BasicChatBotNode
from src.langgraphagenticai.tools.search_tool import get_tools, create_search_tool
from langgraph.prebuilt import ToolNode, tools_condition
from src.langgraphagenticai.nodes.chatbot_tool_node import ChatBotToolNode

class GraphBuilder:
    def __init__(self,model):
        self.llm=model
        self.graph_builder=StateGraph(State)

    def basic_chatbot_build_graph(self):
        """
        Builds a basic chatbot graph using LangGraph.
        This method initializes a chatbot node using the `BasicChatbotNode` class 
        and integrates it into the graph. The chatbot node is set as both the 
        entry and exit point of the graph.
        """

        self.basic_chatbot_node=BasicChatBotNode(self.llm)

        self.graph_builder.add_node("chatbot",self.basic_chatbot_node.process)
        self.graph_builder.add_edge(START,"chatbot")
        self.graph_builder.add_edge("chatbot",END)

    def chatbot_with_web_search_build_graph(self):
        """
        Builds an advanced chatbot graph with web search capabilities.
        This methods provides both chatbot and tool node.
        The chatbot node is set as the entry point.
        """
        # Define tool and tool node
        tools = get_tools()
        tool_node = create_search_tool(tools)
        
        llm = self.llm

        # Define the chatbot node
        obj_chatbot_node = ChatBotToolNode(llm)
        chatbot_node = obj_chatbot_node.create_chatbot(tools)

        # Add the chatbot node
        self.graph_builder.add_node("chatbot", chatbot_node)
        self.graph_builder.add_node("tools", tool_node)

        # Add edges
        self.graph_builder.add_edge(START, "chatbot")
        self.graph_builder.add_conditional_edges("chatbot", tools_condition)
        self.graph_builder.add_edge("tools", "chatbot")

    def setup_graph(self, usecase: str):
        """
        Sets up the graph for the selected use case.
        """
        if usecase == "Basic Chatbot":
            self.basic_chatbot_build_graph()

        if usecase == "Chatbot with Web Search":
            self.chatbot_with_web_search_build_graph()

        return self.graph_builder.compile()
