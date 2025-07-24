import re
import time
from datetime import datetime
from urllib.error import HTTPError

import pandas as pd
import streamlit as st
from Bio import Entrez, Medline

# TODO add configuration to LLM_utils that is specific to LLM_Interfaces, PubMed, etc.


class PubMedInterface:
    def __init__(
        self,
        email="rmelvin@uabmc.edu",
        max_results=50,
        streamlit_context=False,
        max_retries=3,
        delay_seconds=5,
    ):
        self.email = email
        self.max_results = max_results
        self.streamlit_context = streamlit_context
        self.max_retries = max_retries
        self.delay_seconds = delay_seconds
        Entrez.email = email

    def _format_authors(self):
        """
        The function `format_authors` takes a list of strings representing authors and returns a
        formatted string of their last names followed by initials, following APA rules.

        Args:
        author_list: A list of strings, where each string represents an author in the format "Last Name Initials".

        Returns:
        a formatted string of authors' names in the format "Last Name, Initials," following APA rules.
        """
        formatted_authors = []
        num_authors = len(self._authors)

        if num_authors <= 20:
            # Normal case, just list all authors
            for author in self._authors:
                *last_name, initials = author.rsplit(" ", 1)
                last_name = " ".join(last_name)
                formatted_authors.append(f"{last_name}, {initials}.")
            return ", ".join(formatted_authors)
        else:
            # APA rule for > 20 authors: first 19, ellipsis, last author
            for author in self._authors[:19]:
                *last_name, initials = author.rsplit(" ", 1)
                last_name = " ".join(last_name)
                formatted_authors.append(f"{last_name}, {initials}.")

            last_author = self._authors[-1]
            last_author_name, last_author_initials = last_author.rsplit(" ", 1)

            formatted_authors.append("…")
            formatted_authors.append(f"{last_author_name}, {last_author_initials}.")

            return ", ".join(formatted_authors)

    def _format_apa_citation(self):
        """
        The function `format_apa_citation` takes in an article and its ID and returns a formatted APA
        citation string.

        Args:
        article: The `article` parameter is a dictionary that contains information about a specific
        article. It should have the following structure:
        article_id: The article_id parameter is the unique identifier for the article. It is used to
        include the PMID (PubMed ID) in the APA citation format.

        Returns:
        a formatted APA citation for an article, including the authors, publication year, title, journal,
        volume, pages, and PMID (PubMed ID).
        """
        try:
            authors = self._format_authors()
        except KeyError:
            authors = ""

        return f"{authors} ({self._pub_month}). {self._title} {self._journal}, {self._volume}, {self._pages}. PMID: {self._pmid}"

    def _extract_record_data(self, record):
        # Extract the desired information
        self._title = record.get("TI", "No title available")
        self._keywords = record.get("OT", [])  # OT might not be present in all records
        # try to use mesh headers if keywords not present
        if not self._keywords:
            self._keywords = record.get("MH", [])
        self._abstract = record.get("AB", "No abstract available")
        self._pmid = record.get("PMID", "No PMID available")
        self._pub_month = record.get("DP", "No date available")
        self._authors = record.get("AU", [])
        self._journal = record.get("JT", "No jounral name available")
        self._volume = record.get("VI", "No volume available")
        self._pages = record.get("PG", "No pages available")

    def search_pubmed_articles(self, query):
        """
        The function `search_pubmed_articles` takes a PubMed search string, an email address, and an
        optional maximum number of results, and returns a list of PubMed article IDs that match the search
        criteria.

        Args:
        query: The search query string for PubMed.
        email: The email address associated with your NCBI account.
        max_results: Optional; maximum number of results to retrieve (default 10).
        streamlit_context: Optional; a boolean flag indicating whether the code is running within a Streamlit app (default False).
        max_retries: Optional; the maximum number of retry attempts if an HTTP error occurs (default 3).
        delay_seconds: Optional; the number of seconds to wait between retry attempts (default 5).

        Returns:
        A list of PubMed article IDs that match the search criteria.
        """

        for attempt in range(self.max_retries):
            try:
                handle = Entrez.esearch(
                    db="pubmed", term=query, sort="relevance", retmax=self.max_results
                )
                record = Entrez.read(handle)
                handle.close()
                return record["IdList"]
            except HTTPError as e:
                error_message = f"PubMed didn't respond (attempt {attempt + 1}/{self.max_retries}): {e}"
                if attempt < self.max_retries:
                    wait_message = f"Waiting {self.delay_seconds} seconds before trying PubMed again..."
                    print(error_message)
                    print(wait_message)
                    if self.streamlit_context:
                        st.warning(error_message)
                        st.warning(wait_message)
                    time.sleep(self.delay_seconds)
                else:
                    final_message = "Giving up on PubMed. It was an issue on their end. You may want to try again later."
                    print(error_message)
                    print(final_message)
                    if self.streamlit_context:
                        st.warning(error_message)
                        st.warning(final_message)
                    return []

    def fetch_article_details(self, pubmed_ids):
        """
        The function fetches article details from PubMed using the provided PubMed IDs.

        Args:
        pubmed_ids: A list of strings where each string represents the PubMed ID (PMID)
                    of the article you want to fetch details for.
        max_retries: The maximum number of retry attempts if an HTTP error occurs. Default is 3.
        delay_seconds: The number of seconds to wait between retry attempts. Default is 5.
        streamlit_context: A boolean flag indicating whether the code is running within a Streamlit app. Default is False.

        Returns:
        A list of dictionaries, where each dictionary contains the details of an article with the given PubMed ID.
        """
        pubmed_ids = [str(id) for id in pubmed_ids]
        ids_string = ",".join(pubmed_ids)

        for attempt in range(self.max_retries + 1):
            try:
                handle = Entrez.efetch(
                    db="pubmed", id=ids_string, rettype="medline", retmode="text"
                )
                records = Medline.parse(handle)
                records = list(records)
                parsed_data = []
                for record in records:
                    self._extract_record_data(record)
                    citation = self._format_apa_citation()
                    parsed_data.append(
                        {
                            "date_published": self._pub_month,
                            "title": self._title,
                            "keywords": self._keywords,
                            "abstract": self._abstract,
                            "pmid": self._pmid,
                            "authors": self._authors,
                            "journal": self._journal,
                            "citation": citation,
                        }
                    )

                parsed_df = pd.DataFrame(parsed_data)
                return parsed_df
            except HTTPError as e:
                error_message = f"PubMed didn't respond (attempt {attempt + 1}/{self.max_retries}): {e}"
                if attempt < self.max_retries:
                    wait_message = f"Waiting {self.delay_seconds} seconds before trying PubMed again..."
                    print(error_message)
                    print(wait_message)
                else:
                    final_message = "Giving up on PubMed. It was an issue on their end. You may want to try again later."
                    print(error_message)
                    print(final_message)
                    return None

    def fetch_article_details_xml(self, pubmed_ids):
        """
        The function fetches article details from PubMed using the provided PubMed IDs.

        Args:
        pubmed_ids: A list of strings where each string represents the PubMed ID (PMID)
                    of the article you want to fetch details for.
        max_retries: The maximum number of retry attempts if an HTTP error occurs. Default is 3.
        delay_seconds: The number of seconds to wait between retry attempts. Default is 5.
        streamlit_context: A boolean flag indicating whether the code is running within a Streamlit app. Default is False.

        Returns:
        A list of dictionaries, where each dictionary contains the details of an article with the given PubMed ID.
        """
        ids_string = ",".join(pubmed_ids)

        for attempt in range(self.max_retries + 1):
            try:
                handle = Entrez.efetch(db="pubmed", id=ids_string, retmode="xml")
                articles = Entrez.read(handle)["PubmedArticle"]
                handle.close()
                return articles
            except HTTPError as e:
                error_message = f"PubMed didn't respond (attempt {attempt + 1}/{self.max_retries}): {e}"
                if attempt < self.max_retries:
                    wait_message = f"Waiting {self.delay_seconds} seconds before trying PubMed again..."
                    print(error_message)
                    print(wait_message)
                    if self.streamlit_context:
                        # TODO Ask about these imports...
                        st.warning(error_message)
                        st.warning(wait_message)
                    time.sleep(self.delay_seconds)
                else:
                    final_message = "Giving up on PubMed. It was an issue on their end. You may want to try again later."
                    print(error_message)
                    print(final_message)
                    if self.streamlit_context:
                        st.warning(error_message)
                        st.error(final_message)
                    return []
