import csv
from pathlib import Path

import pandas as pd
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders.pdf import PyMuPDFLoader
from langchain_community.vectorstores import FAISS

from aiweb_common.generate.QueryInterface import QueryInterface

#TODO Add documentation for methods and classes throughout
class RAGServicer(QueryInterface):
    def __init__(
        self, language_model_interface, embedding_interface, vectorstore: Path
    ):
        self.vectorstore = vectorstore
        self.embedding_interface = embedding_interface
        super().__init__(language_model_interface)

    def retrieve_data(self, query):
        vectordb = FAISS.load_local(
            self.vectorstore,
            self.embedding_interface,
            allow_dangerous_deserialization=True,
        )
        docsearch = vectordb.as_retriever()
        retrieved_data = docsearch.invoke(query)
        return retrieved_data


class SearchServicer(QueryInterface):
    def __init__(self, language_model_interface, searchable):
        self.searchable = searchable
        super().__init__(language_model_interface)

    #TODO fix yellow underline warning here
    def retrieve_data(self, search_function):
        # docsearch = DocumentSearcher(self.searchable)  # Use a document searcher object
        retrieved_data = search_function(
            self.searchable
        )  # Search documents based on the searchable input
        return retrieved_data


class VectorStoreBuilder:
    # TODO make into factory for PDF/CSV and allowing for future file type integrations
    def __init__(self, embedding_model, output_faiss: Path):
        self.embedding_model = embedding_model
        self.out = output_faiss

    def _clean_csv(self, input_csv):
        # Make sure the data frame is clean - remove NaN and drop duplicates
        df = pd.read_csv(input_csv, na_values=[""])
        df.drop_duplicates(inplace=True)
        df = df.dropna(how="any")
        clean_csv_path = Path(input_csv).parent / "clean_csv_for_vectorstore.csv"
        df.to_csv(clean_csv_path, index=False, quoting=csv.QUOTE_ALL)
        return clean_csv_path

    def convert_csv_to_vectorstore(self, input_csv, clean_csv=False):
        if clean_csv:
            input_csv = self._clean_csv(input_csv)

        csv_loader = CSVLoader(file_path=input_csv)
        documents = csv_loader.load()

        vector_store = FAISS.from_documents(documents, self.embedding_model)
        vector_store.save_local(self.out)

    def load_pdf_and_process(self, file_path):
        loader = PyMuPDFLoader(file_path)
        document = loader.load()
        return document

    def convert_pdf_to_vectorstore(self, pdf_folder):
        folder_path = Path(pdf_folder)
        list_of_docs = folder_path.glob("**/*.pdf")

        vector_store = None
        for idx, file_path in enumerate(list_of_docs):
            document = self.load_pdf_and_process(file_path)
            if idx == 0:
                vector_store = FAISS.from_documents(document, self.embedding_model)
            else:
                vector_store_idx = FAISS.from_documents(document, self.embedding_model)
                vector_store.merge_from(vector_store_idx)

        vector_store.save_local(self.out)
