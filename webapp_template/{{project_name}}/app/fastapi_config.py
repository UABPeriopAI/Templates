CSV_EXPECTED_TYPE = "text/csv"
XLSX_EXPECTED_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

FORM_API_META = {
    "title": "Label Maker",
    "description": "Categorize data using AI",
    "summary": "Brought to you by the Anesthesiology Research, Informatics, and Data Science teams in collaboration with Radiology Imaging Informatics, Clinicians, and Researchers.",
    "version": "0.0.1",
    "contact": {
        "name": "Perioperative Data Science Team",
        "url": "https://twitter.com/UABAnes_AI",
        "email": "rmelvin@uabmc.edu",
    },
    "license_info": {"name": "gpl-3.0", "url": "https://www.gnu.org/licenses/gpl-3.0.en.html"},
}

EXAMPLE_META = {
    "summary": "Takes in csv/xlsx file and categorizes the text data into the either of the user given categories.",
    "description": "Processes a CSV or Excel file and returns a labeled result as a CSV or Excel file. Only accepts files of type CSV ("
    + CSV_EXPECTED_TYPE
    + ") or Excel ("
    + XLSX_EXPECTED_TYPE
    + ").",
    "response_description": "Returns a CSV or Excel of labeled data",
    "responses": {
        200: {
            "content": {
                CSV_EXPECTED_TYPE: {"schema": {"type": "string", "format": "byte"}},
                XLSX_EXPECTED_TYPE: {"schema": {"type": "string", "format": "byte"}},
            },
            "description": "Returns a CSV or Excel file encoded in base64. The client is responsible for decoding the base64 string to retrieve the file.",
        },
        415: {"description": "Unsupported file type. Only CSV and Excel files are accepted."},
    },
    "operation_id": "LabelMaker",
}