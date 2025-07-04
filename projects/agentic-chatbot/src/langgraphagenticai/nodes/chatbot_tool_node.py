from src.langgraphagenticai.state.state import State

class ChatBotToolNode:
    """
    A node that integrates a chatbot with tool capabilities.
    This node can be used to handle chat interactions and invoke tools.
    """

    def __init__(self, model):
        self.llm = model

    def process(self, state: State) -> dict:
        """
        Process the input state and generates a chatbot response with tool invocation.
        """
        user_input = state["messages"][-1] if state["messages"] else ""
        llm_response = self.llm.invoke({"role": "user", "content": user_input})

        tools_response = f"Tool integration for: '{user_input}'\n"

        return {"messages": [llm_response, tools_response]}
    
    def create_chatbot(self, tools):
        """
        Returns a chatbot node function
        """
        llm_with_tools = self.llm.bind_tools(tools)

        def chatbot_node(state: State):
            """
            Chatbot logic for processing the input state and returning a response.
            """
            return {"messages": [llm_with_tools.invoke(state["messages"])]}

        return chatbot_node