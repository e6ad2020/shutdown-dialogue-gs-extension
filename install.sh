#!/bin/bash

glib-compile-schemas ./power-menu@e6ad2020/schemas

if (( $EUID == 0 )); then
	INSTALL_DIR="/usr/share/gnome-shell/extensions"
else
	INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions"
fi
mkdir -p $INSTALL_DIR

echo "Installing extension files in $INSTALL_DIR/power-menu@e6ad2020"
cp -r power-menu@e6ad2020 $INSTALL_DIR

# Compile translations
mkdir -p $INSTALL_DIR/power-menu@e6ad2020/locale/ar/LC_MESSAGES
msgfmt ./power-menu@e6ad2020/po/ar.po -o $INSTALL_DIR/power-menu@e6ad2020/locale/ar/LC_MESSAGES/power-menu@e6ad2020.mo

echo "Done."
exit 0

