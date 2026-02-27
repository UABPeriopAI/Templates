#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIRS=("common" "fastapi_app" "mlops_app")
COMMIT_MSG="${COMMIT_MSG:-Sync template source from monorepo}"
BASE_TAG="${BASE_TAG:-0.1.0}"

echo "Bootstrapping git-tracked template sources..."
echo "Root: ${ROOT_DIR}"

for template_dir in "${TEMPLATE_DIRS[@]}"; do
    full_path="${ROOT_DIR}/${template_dir}"

    if [[ ! -d "${full_path}" ]]; then
        echo "Skipping missing directory: ${template_dir}"
        continue
    fi

    if [[ ! -d "${full_path}/.git" && ! -f "${full_path}/.git" ]]; then
        echo "Initializing git repo: ${template_dir}"
        git -C "${full_path}" init >/dev/null
        git -C "${full_path}" branch -M main >/dev/null
    else
        echo "Found existing git repo: ${template_dir}"
    fi

    git -C "${full_path}" add -A
    if git -C "${full_path}" diff --cached --quiet; then
        echo "No commit needed: ${template_dir}"
    else
        git -C "${full_path}" \
            -c user.name="Template Bootstrap" \
            -c user.email="template-bootstrap@local" \
            commit -m "${COMMIT_MSG}" >/dev/null
        echo "Committed snapshot: ${template_dir}"
    fi

    if [[ -z "$(git -C "${full_path}" tag --list)" ]]; then
        git -C "${full_path}" tag "${BASE_TAG}"
        echo "Created bootstrap tag ${BASE_TAG}: ${template_dir}"
    fi
done

echo "Done."
