from pathlib import Path

from setuptools import find_packages, setup

# Load packages from requirements.txt
BASE_DIR = Path(__file__).parent
requirements_path = Path(BASE_DIR, "requirements.txt")
required_packages = []
dependency_links = []

with open(requirements_path, encoding="utf8") as file:
    for ln in file:
        ln = ln.strip()
        if ln.startswith("./"):  # handle local directory
            dependency_links.append(ln)
        else:
            required_packages.append(ln)

docs_packages = ["mkdocs", "mkdocstrings"]

style_packages = ["black", "flake8", "isort"]

dev_packages = [
    "mkdocstrings[python]",
    "black[jupyter]",
    "autopep8",
    "pip-tools",
    "pandas",
    "pytest",
    "pytest-asyncio",
    "pytest-mock",
]

# Define our package
setup(
    name="{{project_name}}",
    version=0.1,
    description="Testing UV package manager",
    author="RG",
    author_email="ryangodwin@uabmc.edu",
    url="https://anes-vstf.anesthesiology.uab.edu/tfs/DefaultCollection/Data%20Science/_git/TestExec",
    python_requires=">=3.11",
    packages=find_packages(),
    install_requires=[required_packages],
    extras_require={"dev": docs_packages + style_packages + dev_packages, "docs": docs_packages},
    dependency_links=dependency_links,
)
