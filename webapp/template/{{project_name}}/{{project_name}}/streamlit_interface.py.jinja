import pandas as pd
from aiweb_common.streamlit.page_renderer import StreamlitUIHelper

# --------------------------------------------------------------------
# BaseHandler – minimal, re-using common page-renderer functionality
# --------------------------------------------------------------------
class BaseHandler:
    """
    Light-weight helper for:
        1. Uploading a CSV and showing a preview.
        2. Generating & downloading a dummy report.

    All generic Streamlit plumbing (file_uploader wrapper, ensure_file,
    report-text generator, etc.) is delegated to the shared UI helper
    in aiweb_common.streamlit.page_renderer so we don’t re-implement it
    here.
    """
    def __init__(self, ui_helper=StreamlitUIHelper):
        """
        Accepts either UIHelper (backend-agnostic) or StreamlitUIHelper
        (concrete Streamlit implementation).  Anything that follows the
        same method contract will work.
        """
        self.ui = ui_helper

    # ------------------------------
    # 1. CSV upload & quick preview
    # ------------------------------
    def upload_csv_preview(self):
        # NOTE: ui.ensure_file is defined in page_renderer; if that ever
        #       changes we only touch the central helper, not this code.
        file = self.ui.ensure_file(
            file=None,
            upload_message="Please upload a CSV file",
            file_types=("csv",),
            key="csv_uploader",
            info_message="You must upload a CSV file to proceed.",
        )
        if file is not None:
            try:
                df = pd.read_csv(file)

                self.ui.subheader("CSV File Preview")
                self.ui.dataframe(df.head())
                self.ui.success("CSV file loaded successfully!")
                self.ui.balloons()
            except Exception as exc:
                self.ui.error(f"Error reading CSV file: {exc}")

    # -----------------------------------
    # 2. “Generate & Download” dummy txt
    # -----------------------------------
    def download_dummy_report(self):
        """
        Uses ui.generate_dummy_report_download from the shared helper.
        Only the UI orchestration (button / spinner / download link) is
        kept here.
        """
        self.ui.subheader("Generate a Dummy Report")

        if self.ui.button("Generate Report"):
            with self.ui.spinner("Generating report…"):
                # Delegates to common helper
                report_bytes = self.ui.generate_dummy_report_download()

            self.ui.download_button(
                label="Download Dummy Report",
                data=report_bytes,
                file_name="dummy_report.txt",
                mime="text/plain",
            )
            self.ui.success("Report generated!")
            self.ui.balloons()