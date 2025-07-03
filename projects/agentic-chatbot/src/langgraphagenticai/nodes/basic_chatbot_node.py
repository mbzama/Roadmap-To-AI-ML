from src.langgraphagenticai.state.state import State

class BasicChatBotNode:
    """
    A basic chatbot node that can be used in a LangGraph workflow.
    This node can be used to handle simple chat interactions.
    """

    def __init__(self, model):
        self.llm = model

    def process(self, state: State) -> dict:
      """
      Process the input state and generates a chatbot response.
      """
      return {"messages": self.llm.invoke(state["messages"])}
    