import os
import tempfile

import pypandoc


def convert_markdown_docx(output_text, template_location=None):
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".md", delete=False) as temp_md:
        temp_md.write(output_text)
        temp_md.close()  # It is necessary to close the file before conversion

        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as temp_docx:
            output_file_name = temp_docx.name  # creating output file name

            if template_location is not None:
                pypandoc.convert_file(
                    temp_md.name,
                    "docx",
                    outputfile=output_file_name,
                    extra_args=["--reference-doc", template_location],
                )  # converting md to docx with template
            else:
                pypandoc.convert_file(
                    temp_md.name, "docx", outputfile=output_file_name
                )  # converting md to docx without template

            temp_docx.seek(0)  # Seek back to the beginning of the file before reading
            docx_data = temp_docx.read()

        # Cleaning up the temporary files
        os.remove(temp_md.name)
        os.remove(output_file_name)

    return docx_data


# TODO where is this used?
def extract_mesh_elements(data):
    # Can parse xml object for Mesh Headings from pubmed
    # not used currently
    # Usage
    # extracted_strings = extract_mesh_elements(your_api_response)
    # print(extracted_strings)
    # extracts pubmed/medline mesh headers
    strings = []

    def recurse(item):
        if isinstance(item, list):
            for elem in item:
                recurse(elem)
        elif isinstance(item, dict):
            for key, value in item.items():
                recurse(value)
        else:
            if item.__class__.__name__ == "StringElement":
                try:
                    # Attempt to access the string representation of the item
                    strings.append(str(item))
                except Exception as e:
                    print(f"Error extracting string from {item}: {e}")

    recurse(data)
    return strings
