#!/bin/bash

# Define extension name and folder
EXT_ID="power-menu@e6ad2020"

cd "$EXT_ID"

# 1. Compile translations into the local locale folder
# This ensures translations work without shipping .po source files
mkdir -p locale/ar/LC_MESSAGES
mkdir -p locale/de/LC_MESSAGES
msgfmt po/ar.po -o "locale/ar/LC_MESSAGES/$EXT_ID.mo"
msgfmt po/de.po -o "locale/de/LC_MESSAGES/$EXT_ID.mo"

# 2. Build the ZIP file
# -x excludes files that are unnecessary or should not be shipped for review
zip -r "../$EXT_ID.zip" . \
    -x "schemas/gschemas.compiled" \
    -x "po/*" \
    -x "*.sh" \
    -x ".gitignore" \
    -x ".git/*"

echo "Build complete: $EXT_ID.zip"
