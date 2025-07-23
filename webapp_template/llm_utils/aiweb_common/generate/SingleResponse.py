from aiweb_common.generate.Response import ResponseHandler
from aiweb_common.generate.SingleResponseServicer import SingleResponseServicer


class SingleResponseHandler(ResponseHandler):
    def __init__(self, llm_interface):
        super().__init__(llm_interface)
        self.single_response_service = SingleResponseServicer(llm_interface)

    def generate_response(self, assembled_prompt):
        # Focus on the specifics of how to interact with the language model.
        # Implement the details of calling the LLM and handling the response.
        return self.single_response_service.generate_langchain_response(
            assembled_prompt
        )
