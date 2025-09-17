# config.py
import logging
import logging.config
import sys
from pathlib import Path

from rich.logging import RichHandler

class {{project_name}}Config:
    # Development Directories
    """ Directories prepopulated in the template """
    BASE_DIR = Path(__file__).parent.parent.absolute()
    CONFIG_DIR = Path(BASE_DIR, "config")
    LOGS_DIR = Path(BASE_DIR, "logs")

    # Data Directories
    DATA_DIR = Path("/data/DATASCI")
    RAW_DATA = Path(DATA_DIR, "raw")
    INTERMEDIATE_DIR = Path(DATA_DIR, "intermediate")
    RESULTS_DIR = Path(DATA_DIR, "results")

    #Assets
    #Add assets here as needed.
    HEADER_MARKDOWN="""# EXAMPLE Header Markdown \r todo - update this """
    EXAMPLE_OUTPUT = Path(INTERMEDIATE_DIR, "Example_Output.csv")

    # MLFlow model registry



# Make sure log directory exists
{{project_name}}Config.LOGS_DIR.mkdir(parents=True, exist_ok=True)

logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "minimal": {"format": "%(message)s"},
        "detailed": {
            "format": "%(levelname)s %(asctime)s [%(name)s:%(filename)s:%(funcName)s:%(lineno)d]\n%(message)s\n"
        },
    },
    "handlers": {
        "console": {
            "class": "rich.logging.RichHandler",
            "level": logging.DEBUG,
            "formatter": "minimal",
            "markup": True,  # Pass argument to RichHandler
        },
        "info": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str({{project_name}}Config.LOGS_DIR / "info.log"),
            "maxBytes": 10485760,
            "backupCount": 10,
            "formatter": "detailed",
            "level": logging.INFO,
            "mode": "a", 
        },
        "error": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": str({{project_name}}Config.LOGS_DIR / "error.log"),
            "maxBytes": 10485760,
            "backupCount": 10,
            "formatter": "detailed",
            "level": logging.ERROR,
            "mode": "a", 
        },
    },
    "root": {
        "handlers": ["console", "info", "error"],
        "level": logging.INFO,
        "propagate": False,
    },
}

logging.config.dictConfig(logging_config)
logger = logging.getLogger(__name__)