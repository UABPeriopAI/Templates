from aiweb_common.generate.SingleResponse import SingleResponseHandler
from aiweb_common.resource import default_resource_config
from aiweb_common.WorkflowHandler import WorkflowHandler


class PubMedQueryGenerator(WorkflowHandler):
    def __init__(
        self,
        LLM_INTERFACE,
        input_research_q,
    ):
        super().__init__()
        self.input_research_q = input_research_q
        self.single_response = SingleResponseHandler(LLM_INTERFACE)

    def generate_search_string(self, loop_n=0, last_query=""):
        """
        The function generates a search string for a research query using prompts and responses.

        Args:
          loop_n: The `loop_n` parameter in the `generate_search_string` method is used to track the number
        of times the method has been called recursively. It is used to determine if additional prompts or
        information should be included in the search string based on previous iterations. Defaults to 0
          last_query: The `last_query` parameter in the `generate_search_string` method is used to store the
        last query that was executed. It is then appended to the prompt if the `loop_n` parameter is greater
        than 0. This allows the method to provide additional context or information based on the previous
        query

        Returns:
          The function `generate_search_string` returns the response generated based on the assembled
        prompt, after updating the total cost.
        """
        prompt = default_resource_config.PUBMED_QUERY_PROMPT.format(
            self.input_research_q
        )
        if loop_n > 0:
            prompt = (
                prompt + default_resource_config.PUBMED_FEW_RESULTS_PROMPT + last_query
            )

        assembled_prompt = (
            self.single_response.single_response_service.preparer.assemble_prompt(
                system_prompt=default_resource_config.PUBMED_SYSTEM_PROMPT,
                user_prompt=prompt,
            )
        )

        response, response_meta = self.single_response.generate_response(
            assembled_prompt
        )
        self._update_total_cost(response_meta)

        return response.content
