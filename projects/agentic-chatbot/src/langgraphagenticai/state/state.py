from typing_extensions import TypedDict, List
from langgraph.graph.message import add_messages
from typing import Annotated

class State(TypedDict):
    """
    A state that can be used in a LangGraph workflow.
    This state can be used to store messages and other data.
    """
    messages: Annotated[List, add_messages]

