import os

import requests
import streamlit as st


class BYOK_Handler:
    def __init__(self, chat_config, pubmed_chat_config=None, embedding_config=None):
        self.api_key_type = None
        self.api_key = None
        self.CHAT = chat_config
        self.PUBMED_CHAT = pubmed_chat_config
        self.EMBEDDING_CONFIG = embedding_config

    def _incorporate_api_key(self, api_key):
        st.success("API key is valid.")
        os.environ["OPENAI_API_KEY"] = api_key

    def _api_key_validation(self, api_key, end_point):
        pass

    def initialize_api_key(self, api_key, end_point):
        pass

    def get_chat_function(self):
        return self.CHAT

    def get_pubmed_chat_function(self):
        return self.PUBMED_CHAT

    def get_embedding_function(self):
        return self.EMBEDDING_CONFIG


class AzureKeyHandler(BYOK_Handler):
    def _api_key_validation(self, api_key, end_point):
        # TODO: timeout
        response = requests.get(
            end_point + "/openai/models?api-version=2024-02-01",
            headers={"api-key": api_key},
        )

        if response.status_code == 200:
            return True
        else:
            return False

    def initialize_api_key(self, api_key, end_point):
        if self._api_key_validation(api_key, end_point):
            self._incorporate_api_key(api_key)
            return True

        else:
            st.error("API key is invalid.")
            return False


class OpenaiKeyHandler(BYOK_Handler):
    def _api_key_validation(self, api_key, end_point):
        response = requests.get(
            end_point, headers={"Authorization": "Bearer " + api_key}
        )

        if response.status_code == 200:
            return True
        else:
            print(f"Validation failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    def initialize_api_key(self, api_key, end_point):
        if self._api_key_validation(api_key, end_point):
            self._incorporate_api_key(api_key)
            return True
        else:
            st.error("API key is invalid.")
            return False
