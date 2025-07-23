from pathlib import Path

from setuptools import find_packages, setup

# Load packages from requirements.txt
BASE_DIR = Path(__file__).parent
with open(Path(BASE_DIR, "requirements.txt")) as file:
    required_packages = [ln.strip() for ln in file.readlines()]

docs_packages = ["mkdocs", "mkdocstrings"]

style_packages = ["black", "flake8", "isort"]

dev_packages = ["pip-tools", "pandas", "pytest", "pytest-asyncio", "pytest-mock"]

# Define our package
setup(
    name="aiweb_common",
    version=0.1,
    description="General tools for LLM-based apps",
    author="Perioperative Data Science Team at UAB",
    author_email="rmelvin@uabmc.edu",
    url="https://github.com/UABPeriopAI/llm_utils/",
    python_requires=">=3.11",
    packages=find_packages(),  # only look in directores with __init__.py
    extras_require={"dev": docs_packages + style_packages + dev_packages, "docs": docs_packages},
    install_requires=[required_packages],
)
