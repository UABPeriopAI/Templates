from langchain_prompty import create_chat_prompt
from langchain_community.callbacks import get_openai_callback  # Add this import
from aiweb_common.generate.QueryInterface import QueryInterface

class PromptyServicer(QueryInterface):
    def __init__(self, language_model_interface, prompty_file_path):
        super().__init__(language_model_interface)
        self.prompty_file_path = prompty_file_path
        self.prompt = create_chat_prompt(prompty_file_path)

    def generate_langchain_response(self, messages):
        # Define the chat chain
        chain = self.prompt | self.language_model_interface
        with get_openai_callback() as response_meta:
            response = chain.invoke({"messages": messages})
        return response.content, response_meta
