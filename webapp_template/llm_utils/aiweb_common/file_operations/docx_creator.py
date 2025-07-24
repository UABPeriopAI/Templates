import io
import os
from docx import Document
from docx.shared import Inches
from fastapi import BackgroundTasks
import pandas as pd

from .file_handling import file_to_base64, markdown_to_docx_temporary_file


class DocxCreator:
    """
    Parent class that holds the common methods for creating DOCX reports,
    including the results summary and figures.
    """

    def __init__(self, results=None, figures=None):
        self.results = results
        self.figures = figures

 
    def _add_table(self, doc: Document, table_data: pd.DataFrame, heading: str, style: str = "LightShading-Accent1"):
        """
        Insert a table into the DOCX document.
        """
        doc.add_heading(heading, level=2)
        table = doc.add_table(rows=1, cols=len(table_data.columns))
        table.style = style

        # Header row.
        hdr_cells = table.rows[0].cells
        for i, col_name in enumerate(table_data.columns):
            hdr_cells[i].text = col_name

        # Populate the table with data.
        for _, row in table_data.iterrows():
            row_cells = table.add_row().cells
            for i, cell_value in enumerate(row):
                row_cells[i].text = str(cell_value)

        doc.add_paragraph()

    def _add_results_to_docx(self, doc: Document, results: dict):
        """
        Insert results into the DOCX, including tables of metrics.
        """
        doc.add_heading("Results", level=1)
        for method, metrics_data in results.items():

            doc.add_heading(method, level=2)
            
            # Check if the data is already structured into separate sections
            if "metrics" in metrics_data:
                overall_metrics_df = metrics_data["metrics"]
            else:
                # Create a dataframe from the flat metrics (excluding the classification report)
                # Here we assume that 'Classification Report' is separate;
                # Everything else is part of overall metrics.
                overall_metrics = {k: v for k, v in metrics_data.items() if k != "Classification Report" and not isinstance(v, dict)}
                overall_metrics_df = pd.DataFrame(list(overall_metrics.items()), columns=["Metric", "Value"])
            
            self._add_table(doc, overall_metrics_df, "Overall Metrics")
            
            # For classification report, try to get it from either 'report' or 'Classification Report'
            if "report" in metrics_data:
                class_report_df = metrics_data["report"]
            elif "Classification Report" in metrics_data:
                class_report_df = pd.DataFrame(metrics_data["Classification Report"]).transpose()
            else:
                class_report_df = None
            
            if class_report_df is not None:
                self._add_table(doc, class_report_df, "Classification Report")
            
            # If there is any bootstrap information
            if "bootstrap" in metrics_data:
                self._add_table(doc, metrics_data["bootstrap"], "Bootstrap Confidence Intervals")
            
            doc.add_paragraph()
            
    def create_docx_report(self) -> Document:
        doc = Document()
        doc.add_heading("Model Evaluation Report", 0)

        # Add the method comparisons / metrics overview.
        if self.results:
            try:
                self._add_results_to_docx(doc, self.results)
            except Exception as e:
                print("Error in _add_results_to_docx:", e)
                raise

        # Add figures / confusion matrices.
        if self.figures:
            doc.add_heading("Figures", level=1)
            for method, cm_fig in self.figures.items():
                doc.add_heading(method, level=2)
                buf = io.BytesIO()
                try:
                    cm_fig.savefig(buf, format="png", bbox_inches="tight")
                except Exception as e:
                    print(f"Error saving figure for {method}: {e}")
                    raise
                buf.seek(0)
                try:
                    doc.add_picture(buf, width=Inches(5))
                except Exception as e:
                    print(f"Error adding picture for {method}: {e}")
                    raise
                doc.add_paragraph()
        return doc

class StreamlitDocxCreator(DocxCreator):
    """
    A specialized DocxCreator for Streamlit usage. 
    It inherits the _add_results_to_docx and create_docx_report methods 
    directly from the parent class now, so there's no need to redefine them.
    """

    def __init__(self, results, figures):
        super().__init__(results=results, figures=figures)
        # Any additional Streamlit-specific logic can go here.
        # The DOCX generation is handled by the parent.


class FastAPIDocxCreator(DocxCreator):
    """
    A specialized DocxCreator for FastAPI usage. 
    Inherits the common DOCX-report functionality and adds a method 
    to handle markdown-to-docx conversion.
    """

    def __init__(self, background_tasks: BackgroundTasks, results=None, figures=None):
        super().__init__(results=results, figures=figures)
        self.background_tasks = background_tasks

    def convert_markdown_to_docx_bytes(self, generated_response, template_filepath=None) -> str:
        """
        Convert a markdown-based response to a temporary DOCX, then
        base64-encode it for returning via FastAPI.
        """
        print("Converting markdown to temporary file")
        temp_file_path = markdown_to_docx_temporary_file(
            generated_response, template_location=template_filepath
        )
        encoded_file = file_to_base64(temp_file_path)  # Convert file to base64
        print("File encoded")
        self.background_tasks.add_task(os.unlink, temp_file_path)
        return encoded_file