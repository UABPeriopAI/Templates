from aiweb_common.generate.PromptyServicer import PromptyServicer
from aiweb_common.generate.Response import ResponseHandler

class PromptyResponseHandler(ResponseHandler):
    def __init__(self, llm_interface, prompty_file_path):
        super().__init__(llm_interface)
        self.prompty_service = PromptyServicer(llm_interface, prompty_file_path)

    def generate_response(self, messages):
        # Focus on the specifics of how to interact with the language model.
        # Implement the details of calling the LLM and handling the response.
        return self.prompty_service.generate_langchain_response(messages)
