#!/bin/sh

# Define your variables here
project_name="{{cookiecutter.project_name}}"
author="{{cookiecutter.author}}"
author_email="{{cookiecutter.author_email}}"
repository_url="{{cookiecutter.repository_url}}"
data_dir="{{cookiecutter.data_dir}}"
data_directory_name="{{cookiecutter.data_directory_name}}"

# Function to check if a variable is empty
check_empty() {
    var_name=$1
    eval var_value=\$$var_name

    if [ -z "$var_value" ]; then
        echo "$var_name is empty"
        exit 1
    else
        echo "$var_name has the value: $var_value"
    fi
}

# List your variables
for var in project_name author author_email repository_url data_dir data_directory_name; do
    check_empty $var
done

git init

git config user.name "{{cookiecutter.author}}"
git config user.email "{{cookiecutter.author_email}}"

git remote add origin {{cookiecutter.repository_url}}
git fetch
git pull origin master
mv {{cookiecutter.data_directory_name}} {{cookiecutter.data_dir}}
git add .
git commit -m 'initializing from cookiecutter'
git push -u origin master
git branch -M master feature/initialize_template
git branch --remotes --delete  origin/master
git push origin HEAD


# python3 -m mkdocs build -c
# python3 -m mkdocs serve


