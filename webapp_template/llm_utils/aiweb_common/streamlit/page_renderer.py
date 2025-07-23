import streamlit as st


class UIHelper:

    """
    A thin wrapper around Streamlit calls so the core logic isn’t tied directly to st.xxx calls.
    """

    def hide_streamlit_branding():
        hide_streamlit_style = """
                <style>
                #MainMenu {visibility: hidden;}
                footer {visibility: hidden;}
                </style>
                """
        st.markdown(hide_streamlit_style, unsafe_allow_html=True)
    
    def apply_uab_font():
        streamlit_style = """
                <style>
                html, body, [class*="css"]  {
                font-family: proxima-nova, sans-serif;
                }
                </style>
                """
        st.markdown(streamlit_style, unsafe_allow_html=True)
    
    def __init__(self):
        self.session_state = st.session_state

    def balloons(self):
        st.balloons()

    def button(self, label, key=None):
        return st.button(label, key=key)

    def checkbox(self, label, help, key=None):
        return st.checkbox(label=label, help=help, key=key)

    def dataframe(self, data, **kwargs):
        return st.dataframe(data, **kwargs)

    def download_button(self, label, data, file_name, mime, **kwargs):
        return st.download_button(label, data, file_name, mime, **kwargs)

    def error(self, text):
        st.error(text)

    def expander(self, label, expanded=True):
        return st.expander(label, expanded=expanded)

    def file_uploader(self, label, type, accept_multiple_files, key):
        return st.file_uploader(
            label, type=type, accept_multiple_files=accept_multiple_files, key=key
        )

    def header(self, text):
        return st.header(text)

    def info(self, text):
        st.info(text)

    def markdown(self, text):
        st.markdown(text)

    def multiselect(self, label, options, **kwargs):
        return st.multiselect(label, options, **kwargs)

    def number_input(self, label, **kwargs):
        return st.number_input(label, **kwargs)

    def pyplot(self, figure):
        st.pyplot(figure)

    def radio(self, label, options, **kwargs):
        return st.radio(label, options, **kwargs)

    def rerun(self):
        st.rerun(scope="app")

    def selectbox(self, label, options, **kwargs):
        return st.selectbox(label, options, **kwargs)

    def spinner(self, text):
        return st.spinner(text)

    def subheader(self, text):
        return st.subheader(text)

    def success(self, text):
        st.success(text)

    def text_input(self, label, value="", key=None):
        return st.text_input(label, value=value, key=key)

    def warning(self, text):
        st.warning(text, icon="🚨")

    def write(self, text):
        st.write(text)
