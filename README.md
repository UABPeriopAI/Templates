# MLOps: A Template Framework for Traceable Machine Learning and Artificial Intelligence
This repository contains a [cookiecutter template](https://cookiecutter.readthedocs.io/en/stable/) for deploying a MLOps infrastructure, brought to you by the [Perioperative Data Science Team at the University of Alabama, Birmingham](https://sites.uab.edu/periop-datascience/).

## Setting up the Environment
The application was built and tested in a Windwos Subsystem for Linux 2 (WSL2) environment.  The software should work in either a WSL2 or Linux environment. If you are using a Linux environment, skip the installation steps for WSL2.  While it is possible to get this tool to work without all these steps, we highly encourage users to install WSL2, Docker, and VSCode for the optimal experience using this software.

### Install WSL2 on Windwos
  Follow the instructions for [installing WSL2](https://github.com/UABPeriopAI/Templates/wiki/Setting-up-WSL2).

### Install Git inside WSL2
Additionally, you may want to follow the [instructions for our recommended usage of git in WSL2](https://github.com/UABPeriopAI/Templates/wiki/Recommended-git-Usage-in-WSL2).

### Install Docker
Follow the instructions for [installing Docker](https://github.com/UABPeriopAI/Templates/wiki/Setting-up-Docker) from the MLOps Template repository Wiki.

### Install VSCode
Follow the instructions for [installing VSCode](https://github.com/UABPeriopAI/Templates/wiki/Installing-VSCode) from the MLOps Template repository Wiki.

## Cookiecutter Setup
If you are working in a Windows environment, first [install Windows Subsystem](https://learn.microsoft.com/en-us/windows/wsl/install) for Linux 2 (WSL 2).  This streamlines installation and makes porting projects to cloud or other environments easier.  See the project Wiki for additional installation and setup guidance.

In order to use this template, the cookiecutter package must first be installed. You can test this by typing the following in the WSL 2 command line: 
~~~
cookiecutter --version
~~~ 



The output should look something like the following:
```
'Cookiecutter 1.7.3 from /home/rgodwin/anaconda3/lib/python3.6/site-packages (Python 3.6)'
```

If it's not already installed, you can do so with Pip:
~~~
pip install cookiecutter
~~~

## Usage
1. Before using the cookiecutter, create a new, empty repository for your project - you'll need the URL shortly.


2. With cookiecutter, you can call this repository directly from the command line.  This cookiecutter is designed to install the codebase and it automatically creates and relocates the data structure.   An example of how to create a new project from this template looks like:
~~~
cookiecutter https://github.com/UABPeriopAI/Templates --checkout main --directory mlops_template

cookiecutter https://github.com/UABPeriopAI/Templates --checkout main --directory webapp_template
~~~
Executing this command will initiate prompts for you to enter project specific information.   Our template has the following inputs for a new project (with default values in parenthesis)
#### cc-codebase
- [ ] Project Name* (default_proj) - Name of the new project.  This paramter is used in a number of places and should be a title that the user can use to readily identify the project.
- [ ] Author Name* () - Name of the person creating the project.  This will be used in the setup.py file and in git commit messages.
- [ ] Description () - Brief description of what the software is intended to do
- [ ] Author Email* () - Be sure to use the email connected to your version control account
- [ ] Repository URL* () - The empty git Repository URL for the new project from step 1
- [ ] Data Directory* () - The folder where you plan to put the data (eventually we will move it there automatically, but for now this just updates the devcontainer.json so the Docker container knows where to find the data)
- [ ] Data directory* name (DATASCI)

A * next to the parameter indicates a field that is required for the template to deploy as intended. Many default values are left blank, because we make no presumptions about the specific information for a project. We encourage users to provide input for all fields, although *Description* is not requried for the template to deploy correctly. 

##### After running the cookiecutter
+ The contents of the template are pushed to a new repository branch "feature/initialize_template" which is ready to merge to main. Additionally, there will be a remenant master branch that can be deleted (cookiecutter creates a master branch, but out group prefers the name 'main'.)

+ The data directory will be automatically created and moved to Data_Directory/Data_Directory_name/

+ *Note:* The post_gen_project.sh script sometimes generates an error even after successful deployment of the template.  


##### Troubleshooting
Depending on the repository for the new project, users may have to setup programmatic access to the repository.  For example, GitHub requires use of a personal access token to programmatically access repositories.  Users can follow the instructions [here](https://stackoverflow.com/questions/68775869/message-support-for-password-authentication-was-removed)
to setup a personal access token on GitHub and integrate it into their operating system (via Windows Credential Manager, for example.)

Disclosure: This template may not work out of the box in every environment, but the contents of the template can be modified, the Docker parameters in particular, to get it working. 
