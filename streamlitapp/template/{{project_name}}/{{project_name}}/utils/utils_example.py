import pandas as pd

# Add any project-specific utility functions here.
def upload_example(ui):
    """
    Task A: Allows the user to upload a CSV file and then preview the first few rows.
    """
    uploaded_file, extension = ui.file_uploader_with_info(label = 'Default Label', file_types = ['pdf'], help_text = "halp")
    return uploaded_file, extension


def download_example(ui):
    """
    Task B: Generates a dummy report that the user can download.
    """
    ui.subheader("Generate a Dummy Report")
    if ui.button("Generate Report"):
        with ui.spinner("Generating report..."):
            report_bytes = handler.generate_dummy_report_download()
        ui.download_button(
            label="Download Dummy Report",
            data=report_bytes,
            file_name="dummy_report.txt",
            mime="text/plain"
        )
        ui.success("Report generated!")
        ui.balloons()