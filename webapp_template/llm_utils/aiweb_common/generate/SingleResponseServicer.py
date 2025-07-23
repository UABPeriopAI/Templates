from aiweb_common.generate.QueryInterface import QueryInterface


class SingleResponseServicer(QueryInterface):
    def __init__(self, language_model_interface):
        super().__init__(language_model_interface)
