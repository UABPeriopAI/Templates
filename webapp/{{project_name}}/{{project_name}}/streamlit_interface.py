import io
import streamlit as st
import pandas as pd
from aiweb_common.streamlit.page_renderer import UIHelper


# Imports used exclusively by EvaluateHandler.
from {{project_name}}.Evaluate.data_loader import DataLoader
from {{project_name}}.Evaluate.evaluator import Evaluator
from {{project_name}}.utils.file_manager import FileManager
from {{project_name}}_config.config import Config


class BaseHandler:
    """
    A bare-bones helper that provides functionality for file upload and report generation.
    """
    def __init__(self, ui_helper=UIHelper):
        # Expect ui_helper to be an object that provides Streamlit functionality (in this case, just st)
        self.ui = ui_helper

    def ensure_file(self, file, upload_message, file_types, key, info_message):
        """
        Checks if a file is provided; otherwise prompts the user to upload one.
        """
        if file is None:
            file = self.ui.file_uploader(
                label=upload_message,
                type=file_types,
                key=key
            )
            if file is None:
                self.ui.info(info_message)
        return file

    def generate_dummy_report_download(self):
        """
        Generates a dummy text report as bytes.
        """
        report_text = "Hello!\n\nThis is your dummy report generated on demand."
        temp_stream = io.BytesIO()
        temp_stream.write(report_text.encode("utf-8"))
        temp_stream.seek(0)
        return temp_stream.read()

def upload_example():
    """
    Task A: Allows the user to upload a CSV file and then preview the first few rows.
    """
    handler = BaseHandler(st)
    # Try to get a file; if none is provided, show an info message automatically
    file = handler.ensure_file(
        file=None,
        upload_message="Please upload a CSV file",
        file_types=["csv"],
        key="csv_uploader",
        info_message="You must upload a CSV file to proceed."
    )
    if file is not None:
        try:
            # Read and display the CSV contents
            df = pd.read_csv(file)
            # TODO Do something with the df...
            # example_task_a.process()
            st.subheader("CSV File Preview")
            st.dataframe(df.head())
            
            st.success("CSV file loaded successfully!")
            st.balloons()
        except Exception as e:
            st.error(f"Error reading CSV file: {e}")

def download_example():
    """
    Task B: Generates a dummy report that the user can download.
    """
    handler = BaseHandler(st)
    st.subheader("Generate a Dummy Report")
    if st.button("Generate Report"):
        with st.spinner("Generating report..."):
            report_bytes = handler.generate_dummy_report_download()
        st.download_button(
            label="Download Dummy Report",
            data=report_bytes,
            file_name="dummy_report.txt",
            mime="text/plain"
        )
        st.success("Report generated!")
        st.balloons()