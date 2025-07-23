from langchain_community.callbacks import get_openai_callback
from langchain_core.messages import AIMessage, HumanMessage

from aiweb_common.generate.QueryInterface import QueryInterface


class ChatServicer(QueryInterface):
    def __init__(self, language_model_interface, prompt):
        super().__init__(language_model_interface)
        assembled_system_chat_template = self.preparer.assemble_chat_template(
            prompt=prompt
        )
        self.assembled_system_chat_template = assembled_system_chat_template

    def generate_langchain_response(self, messages):
        # Define the chat chain
        chain = self.assembled_system_chat_template | self.language_model_interface
        with get_openai_callback() as response_meta:
            response = chain.invoke({"messages": messages})
        return response.content, response_meta

    def update_history(self, message, chat_history):
        if message.role == "ai":
            chat_history.append(AIMessage(content=message.content))
        elif message.role == "human":
            chat_history.append(HumanMessage(content=message.content))
        return chat_history
