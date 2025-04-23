API_META = {
    "title": "Template",
    "description": "Standard template for projects",
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
    "summary": "Example template",
    "description": "Example meta that has to be rewritten based on the application.",
    "response_description": "Returns the validated 'name'.",
    "responses": {
        200: {
            "description": "Successful response with the 'name' in the response body.",
            "content": {
                "application/json": {
                    "schema": {
                        "type": "string"
                    }
                }
            }
        },
        400: {
            "description": "Name parameter is missing."
        },
    },
    "operation_id": "Example",
}