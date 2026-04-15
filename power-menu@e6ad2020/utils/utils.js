/*
 * Power Menu for GNOME Shell
 *
 * Helper utilities for managing keybindings.
 *
 * License: MIT
 */

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

/**
 * Set a GSettings keybinding
 *
 * @param {Gio.Settings} settings - The settings object
 * @param {string} key - The setting key
 * @param {string[]} value - The array of key combinations
 */
export function setKeybinding(settings, key, value) {
    settings.set_strv(key, value);
}

/**
 * Remove a keybinding from the GNOME Shell window manager
 *
 * @param {string} name - The identity of the keybinding
 */
export function removeKeybinding(name) {
    Main.wm.removeKeybinding(name);
}