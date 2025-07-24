import glob
import os
from abc import ABC, abstractmethod

import pyodbc
import yaml
from langchain.prompts import ChatPromptTemplate
from langchain_core.messages.ai import AIMessage


class WorkflowHandler(ABC):
    def __init__(self):
        self.total_cost = 0.0

    def _get_filename(self):
        # should not be forced. datafeasibility, for example, wouldn't use.
        raise NotImplementedError

    def _get_mime_type(self):
        # should not be forced. datafeasibility, for example, wouldn't use.
        raise NotImplementedError

    @abstractmethod
    def process(self):
        raise NotImplementedError

    def _update_total_cost(self, response_meta):
        self.total_cost += response_meta.total_cost

    def _get_db_connection(self, db_server, db_name, db_user, db_password):
        """
        The function `get_db_connection` creates a database connection using the provided server, database
        name, user, and password.

        Args:
        db_server: The `db_server` parameter refers to the server where the database is hosted. This could
        be an IP address or a domain name pointing to the server where the SQL Server instance is running.
        db_name: The `db_name` parameter in the `get_db_connection` function refers to the name of the
        database you want to connect to on the specified database server. This parameter is used to
        construct the connection string that includes information such as the database name, server details,
        user credentials, and driver information for
        db_user: The `db_user` parameter in the `get_db_connection` function refers to the username used
        to authenticate and access the database. It is typically associated with a specific user account
        that has the necessary permissions to interact with the database specified by `db_name` on the
        server `db_server`.
        db_password: It seems like you were about to provide information about the `db_password` parameter
        but the text got cut off. Could you please provide the details or let me know how I can assist you
        further with the `db_password` parameter?

        Returns:
        The function `get_db_connection` returns a connection object to a SQL Server database using the
        provided server, database name, user, and password details.
        """
        conn_str = (
            "DRIVER={ODBC Driver 17 for SQL Server};SERVER="
            + db_server
            + ";DATABASE="
            + db_name
            + ";UID="
            + db_user
            + ";PWD="
            + db_password
        )
        return pyodbc.connect(conn_str)

    def _write_to_db(
        self,
        app_config,
        input_as_json,
        submit_time,
        response_time,
        cost,
        name_suffix="",
    ):
        """
        The `write_to_db` function inserts data into a database table `api_interactions` with specified
        columns using the provided parameters.

        Args:
        app_config: The `app_config` parameter is a configuration object that contains information about
        the database server, database name, database user, and database password needed to establish a
        connection to the database. It likely contains attributes like `DB_SERVER`, `DB_NAME`, `DB_USER`,
        `DB_PASSWORD`, and `NAME
        input_as_json: The `input_as_json` parameter in the `write_to_db` function is expected to be a
        JSON object representing the user input data that you want to store in the database. This JSON
        object should be a serializable format that can be stored in a database column, typically a string
        representation of the
        submit_time: Submit time is the timestamp when the request was submitted to the API. It typically
        includes the date and time when the request was made.
        response_time: Response time is the time taken for the server to process a request and send a
        response back to the client. It is usually measured in milliseconds and indicates the efficiency of
        the system in handling requests.
        cost: The `cost` parameter in the `write_to_db` function represents the total cost associated with
        the API interaction being recorded in the database. This cost could be related to any expenses
        incurred during the interaction, such as processing fees, data storage costs, or any other relevant
        expenses. It is a numerical
        name_suffix: The `name_suffix` parameter in the `write_to_db` function is an optional parameter
        that allows you to append a suffix to the `app_name` field in the database. This can be useful if
        you need to differentiate between multiple instances of the same application in the database. If a
        `name
        """
        with self._get_db_connection(
            db_server=app_config.DB_SERVER,
            db_name=app_config.DB_NAME,
            db_user=app_config.DB_USER,
            db_password=app_config.DB_PASSWORD,
        ) as conn:
            cursor = conn.cursor()
            query = """
            INSERT INTO api_interactions (app_name, user_input, submit_time, response_time, total_cost)
            VALUES (?, ?, ?, ?, ?)
            """
            cursor.execute(
                query,
                (
                    app_config.NAME + name_suffix,
                    input_as_json,
                    submit_time,
                    response_time,
                    cost,
                ),
            )
            conn.commit()

    def check_content_type(self, returned_content):
        # TODO: consider changing to if hasattr content
        if isinstance(returned_content, AIMessage):
            extracted_content = returned_content.content
        if isinstance(returned_content, str):
            extracted_content = returned_content
        else:
            raise TypeError(
                "Content not of type AIMessage or str. Check what invoke is returning. Langchain interfaces are inconsistent per API provider."
            )
        return extracted_content

    # TODO is there a way to make this cleaner since self.promtpy_path and self._validate are only called in grandchildren
    def load_prompty(self):
        # self.prompty_path initialized by child
        # This should likely be broken up more with to isolate functionality further
        if not self.prompty_path.exists():
            raise FileNotFoundError(f"Prompty file not found at: {self.prompty_path}")
        with open(self.prompty_path, "r") as f:
            prompty_content = f.read()
        prompty_data = list(yaml.safe_load_all(prompty_content))
        if not prompty_data or len(prompty_data) < 2:
            raise ValueError("Invalid prompty file format.")
        prompt_section = prompty_data[1]
        prompt_template = prompt_section.get("prompt", {}).get("template", None)
        if prompt_template is None:
            raise ValueError("Prompt template not found in prompty file.")
        self._validate_prompt_template(prompt_template)
        return ChatPromptTemplate.from_template(prompt_template, template_format="jinja2")

    def log_to_database(
        self, app_config, content_to_log, start, finish, background_tasks, label=""
    ):
        """
        This Python function logs content to a database using background tasks and handles KeyError
        exceptions.

        Args:
          app_config: The `app_config` parameter likely contains configuration settings for the application,
        such as database connection details, API keys, or other settings needed for logging to the database.
          content_to_log: The `content_to_log` parameter typically refers to the data or information that
        you want to log into the database. This could be any relevant information that you want to store for
        later analysis or reference. It could be a string, a dictionary, a list, or any other data structure
        that you find
          start: The `start` parameter in the `log_to_database` method likely represents the start time of
        the logging operation. It is used to indicate when the logging process began.
          finish: Finish is a parameter representing the time when the logging process finishes. It is used
        in the `log_to_database` method to log information to a database along with other parameters such as
        `app_config`, `content_to_log`, `start`, `background_tasks`, and an optional `label`.
          background_tasks: The `background_tasks` parameter in the `log_to_database` method seems to be an
        instance of some class that allows you to add tasks to be executed in the background. In this
        method, a task is added to write data to a database in the background using the `_write_to_db`
        method
          label: The `label` parameter in the `log_to_database` method is a string that can be used to
        provide additional information or context for the log entry being written to the database. It is an
        optional parameter with a default value of an empty string. If provided, the `label` will be
        included
        """
        try:
            background_tasks.add_task(
                self._write_to_db,
                app_config,
                content_to_log,
                start,
                finish,
                self.total_cost,
                label,
            )
        except KeyError:
            raise KeyError(
                "Failed writing to database. Check interface configuration and try again."
            )


def manage_sensitive(name):
    """
    The `manage_sensitive` function retrieves sensitive information from different sources based on
    deployment and development paths, as well as environment variables, and raises an error if the
    secret is not found.

    Args:
      name: The `name` parameter in the `manage_sensitive` function is used to specify the name of the
    sensitive information or secret that the function is trying to retrieve. The function first checks
    for the existence of the secret in a deployment path, then in a development path using glob, and
    finally as an environment

    Returns:
      The `manage_sensitive` function is designed to manage sensitive information retrieval from
    different sources. It first checks for the secret file in the deployment path, then in the
    development path using glob, and finally as an environment variable. If the secret is found in any
    of these sources, it is returned. If no secret is found, a `KeyError` is raised with a message
    indicating that the secret with
    """
    # Check in deployment path
    deploy_secret_fpath = f"/run/secrets/{name}"
    if os.path.exists(deploy_secret_fpath):
        with open(deploy_secret_fpath, "r") as file:
            return file.read().rstrip("\n")

    # Check in development path using glob
    develop_secret_paths = glob.glob(f"/workspaces/*/secrets/{name}.txt")
    if develop_secret_paths:
        # Assumes the first matching file is the correct one, adjust if necessary
        with open(develop_secret_paths[0], "r") as file:
            return file.read().rstrip("\n")

    # Check environment variable last
    v1 = os.getenv(name)
    if v1 is not None:
        return v1

    # If no secret is found
    raise KeyError(f"Secret {name} not found")
