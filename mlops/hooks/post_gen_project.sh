#!/bin/sh

# Define your variables here
project_name="{{project_name}}"
author="{{author_name}}"
author_email="{{author_email}}"
repository_url="{{repository_url}}"
data_dir="{{data_dir}}"
data_directory_name="{{data_directory_name}}"

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

git config user.name author
git config user.email author_email

git remote add origin repository_url
git fetch
git pull origin master
mv data_directory_name data_dir
git add .
git commit -m 'initializing from cookiecutter'
git push -u origin master
git branch -M master feature/initialize_template
git branch --remotes --delete  origin/master
git push origin HEAD



