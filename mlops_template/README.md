# STREAM: Systematic Template for Reliable and Efficient Artificial intelligence and Machine learning

STREAM is a powerful MLOps template designed to facilitate collaborative code development, automate processes, and ensure data traceability in machine learning workflows.

## Repository Structure

The repository is organized into two main directories:

1. `hooks`: This directory contains scripts that are executed before (`pre_gen_project.py` - *unused*) and after (`post_gen_project.py`) the template deployment.

2. `{{project_name}}`: This is the main project directory that gets created upon deployment of the template.

Additionally, the repository contains a `cookiecutter.json` file that defines the variables used by the Cookiecutter and sets their default values.

## Usage

To use STREAM, you need to have [Cookiecutter](https://github.com/cookiecutter/cookiecutter) installed. If you do not have it, you can install it using pip:

```sh
pip install cookiecutter
```

To create a new project using the STREAM template, navigate to the parent directory where you want your project to reside and run:

```sh
cookiecutter https://github.com/your_username/STREAM.git
```

You will then be prompted to enter values for the variables defined in `cookiecutter.json`, which will be used to customize your new project.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the terms of the GPL license. See the [LICENSE](../LICENSE) file for the full license text.

## Contact

If you have any questions or feedback, please feel free to [contact us](mailto:ryangodwin@uab.edu).
