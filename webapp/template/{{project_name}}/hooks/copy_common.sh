#!/usr/bin/env bash
echo "→ Copying common files..."
echo $TEMPLATE_ROOT
echo $COPIER_DEST

set -euo pipefail

# $TEMPLATE_ROOT is passed below
cp -R "$TEMPLATE_ROOT/../common/template/." "$COPIER_DEST/"