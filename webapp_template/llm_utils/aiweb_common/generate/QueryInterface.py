from abc import ABC

from langchain_community.callbacks import get_openai_callback

from aiweb_common.generate.PromptAssembler import PromptAssembler


class QueryInterface(ABC):
    def __init__(self, language_model_interface):
        self.language_model_interface = language_model_interface
        self.preparer = PromptAssembler()

    def retrieve_data(self, prompt):
        # Must override this method
        raise NotImplementedError

    def generate_langchain_response(self, assembled_prompt):
        with get_openai_callback() as response_meta:
            response = self.language_model_interface.invoke(assembled_prompt)
        return response, response_meta
