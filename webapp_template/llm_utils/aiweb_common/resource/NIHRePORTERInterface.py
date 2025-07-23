import csv
import json
from datetime import datetime

import requests

from aiweb_common.resource import default_resource_config


class NIHRePORTERAPI:
    def __init__(self, request_api_url, request_headers, request_data, request_timeout):
        self.request_api_url = request_api_url
        self.request_headers = request_headers
        self.request_data = request_data
        self.request_timeout = request_timeout

    def _sanitize_field(self, field, field_name, max_length=5000):
        if field is not None and len(field) <= max_length:
            # Replace double quotes with single quotes
            field = field.replace('"', "'")
            # Replace commas with semicolons
            # field = field.replace(',', ';')
            # Replace newlines with spaces
            field = field.replace("\n", " ")
        else:
            field = ""
        return field

    # Make the request
    def _make_nih_reporter_request(self):
        response = requests.post(
            self.request_api_url,
            headers=self.request_headers,
            data=self.request_data,
            timeout=self.request_timeout,
        )
        return response

    def scrape_nih_reporter(
        self,
        filename,
        csv_headers,
        fiscals_years=5,
        departments=default_resource_config.NIH_DEPARTMENTS,
        limit=500,
    ):

        # Open the CSV file for writing
        with open(filename, "w", newline="") as f:
            writer = csv.writer(f, quoting=csv.QUOTE_ALL)

            # Write the headers
            writer.writerow(csv_headers)

            # Get the current year
            current_year = datetime.now().year
            if departments == []:
                AttributeError(
                    "No departments selected, configure departments variable and try again"
                )
            else:
                for department in departments:
                    offset = 0
                    while offset <= 14999:  # api limit
                        # Define the payload
                        payload = {
                            "criteria": {
                                "fiscal_years": list(
                                    range(
                                        current_year - (fiscals_years - 1), current_year
                                    )
                                ),
                                "dept_types": [department],
                                "award_type": "1",
                                "use_relevance": True,
                                "include_active_projects": True,
                            },
                            "include_fields": default_resource_config.NIH_INCLUDE_FIELDS,
                            "offset": offset,
                            "limit": limit,
                        }

                        # Convert the payload to JSON format
                        # payload_json = json.dumps(payload)

                        # Make the request
                        response = self._make_nih_reporter_request()
                        data = response.json()

                        # If no results, break the loop
                        if (
                            isinstance(data, list)
                            and len(data) == 1
                            and "exceeded total records count" in data[0]
                        ):
                            break

                        # Loop through each result
                        for result in data["results"]:
                            # Use try-except block for each attribute

                            try:
                                pi = self._sanitize_field(
                                    result.get("contact_pi_name"), "contact_pi_name"
                                )
                            except AttributeError:
                                pi = ""

                            try:
                                org_name = self._sanitize_field(
                                    result["organization"].get("org_name"), "org_name"
                                )
                            except AttributeError:
                                org_name = ""

                            try:
                                title = self._sanitize_field(
                                    result.get("project_title"), "project_title"
                                )
                            except AttributeError:
                                title = ""

                            try:
                                abstract = self._sanitize_field(
                                    result.get("abstract_text"), "abstract_text"
                                )
                                if abstract is not None:
                                    abstract = abstract.replace("\n", " ")
                            except AttributeError:
                                abstract = ""

                            try:
                                phr = self._sanitize_field(
                                    result.get("phr_text"), "phr_text"
                                )
                                if phr is not None:
                                    phr = phr.replace("\n", " ")
                            except AttributeError:
                                phr = ""

                            # Write the row
                            writer.writerow([pi, org_name, title, abstract, phr])

                        # Increase the offset by limit
                        offset += limit
