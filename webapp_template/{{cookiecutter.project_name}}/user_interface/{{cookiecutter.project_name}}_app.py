"""
The main app file sets up a Streamlit UI with tabs for two example tasks.
Each tab calls a function from streamlit_handler to display its content.
"""
import streamlit as st
from {{cookiecutter.project_name}}.utils.page_renderer import UIHelper
from {{cookiecutter.project_name}}_config.config import Config
from {{cookiecutter.project_name}}.streamlit_handler import task_a, task_b

def main():
    """
    Main sets up the web app title, header and tabs.
    """
    st.set_page_config(page_title="{{cookiecutter.project_name}}", page_icon="🏷️")
    st.title("🏷️ {{cookiecutter.project_name}} 🤖")
    st.markdown(Config.HEADER_MARKDOWN)
    
    # Create a UI helper instance. (This can be used to wrap Streamlit calls if needed.)
    ui = UIHelper()
    
    # Create two tabs in the app for the example tasks.
    tab1, tab2 = st.tabs(["Example Task A", "Example Task B"])
    
    with tab1:
        # Call task A — CSV file upload and preview.
        task_a()
        
    with tab2:
        # Call task B — Dummy report generation and download.
        task_b()

if __name__ == "__main__":
    main()