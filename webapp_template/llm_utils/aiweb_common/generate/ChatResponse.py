from aiweb_common.generate.ChatServicer import ChatServicer
from aiweb_common.generate.Response import ResponseHandler


class ChatResponseHandler(ResponseHandler):
    def __init__(self, llm_interface, prompt):
        super().__init__(llm_interface)
        print("initializing chat servicer")
        self.chat_service = ChatServicer(self.llm_interface, prompt)

    def generate_response(self, messages):
        # Focus on the specifics of how to interact with the language model.
        # Implement the details of calling the LLM and handling the response.
        return self.chat_service.generate_langchain_response(messages)

    def update_history(self, message, conversation_history):
        return self.chat_service.update_history(message, conversation_history)
