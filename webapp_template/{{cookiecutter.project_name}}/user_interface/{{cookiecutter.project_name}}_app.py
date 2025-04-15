"""
The `main` function in the `app.py` file sets up a Streamlit UI for a label maker application with
tabs for spreadsheet upload, multiple document upload, and evaluating labeling performance.

"""
import streamlit as st

from {{cookiecutter.project_name}}.utils.page_renderer import UIHelper
from {{cookiecutter.project_name}}_config.config import Config


def main():
    """
    The `main()` function sets up a Label maker application with tabs for spreadsheet upload, multiple
    document upload, and evaluating labeling performance.

    """
    st.set_page_config(page_title="{{cookiecutter.project_name}}", page_icon="🏷️")
    st.title("🏷️ {{cookiecutter.project_name}} 🤖")
    st.markdown(Config.HEADER_MARKDOWN)
    ui = UIHelper()

    tab1, tab2 = st.tabs(["Example Task A", "Example Task B"])
    with tab1:
        #Example do example task A
        #TODO update to add functionality
        ui
        pass
    with tab2:
        #Exapmle do example task B
        #TODO update to add functionality
        pass

if __name__ == "__main__":
    main()