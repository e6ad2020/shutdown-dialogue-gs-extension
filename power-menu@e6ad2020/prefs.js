import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const ACTION_DEFINITIONS = {
    'poweroff': { name: 'Shutdown', icon: 'system-shutdown-symbolic' },
    'suspend': { name: 'Suspend', icon: 'weather-clear-night-symbolic' },
    'reboot': { name: 'Restart', icon: 'system-reboot-symbolic' },
    'logout': { name: 'Log Out', icon: 'system-log-out-symbolic' },
};

export default class ShutdownDialoguePreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        const settings = this.getSettings('org.gnome.shell.extensions.power-menu');

        window.set_default_size(500, 500);

        const page = new Adw.PreferencesPage({
            title: _('Actions'),
            icon_name: 'system-shutdown-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Dialogue Actions'),
            description: _('Configure which actions appear in the shutdown dialogue and their order. Use the arrow buttons to reorder.'),
        });
        page.add(group);

        this._settings = settings;
        this._group = group;
        this._rows = [];

        this._buildRows();

        // Listen for external setting changes
        this._orderChangedId = settings.connect('changed::action-order', () => {
            this._buildRows();
        });
        this._visibilityChangedId = settings.connect('changed::action-visibility', () => {
            this._buildRows();
        });

        window.connect('close-request', () => {
            if (this._orderChangedId) {
                settings.disconnect(this._orderChangedId);
                this._orderChangedId = null;
            }
            if (this._visibilityChangedId) {
                settings.disconnect(this._visibilityChangedId);
                this._visibilityChangedId = null;
            }
        });
    }

    _buildRows() {
        // Remove existing rows
        for (const row of this._rows) {
            this._group.remove(row);
        }
        this._rows = [];

        const actionOrder = this._settings.get_strv('action-order');
        const actionVisibility = this._settings.get_strv('action-visibility');

        for (let i = 0; i < actionOrder.length; i++) {
            const actionId = actionOrder[i];
            const def = ACTION_DEFINITIONS[actionId];
            if (!def) continue;

            const row = new Adw.ActionRow({
                title: _(def.name),
                icon_name: def.icon,
            });

            // Visibility toggle
            const toggle = new Gtk.Switch({
                active: actionVisibility.includes(actionId),
                valign: Gtk.Align.CENTER,
            });
            toggle.connect('notify::active', (sw) => {
                this._setActionVisibility(actionId, sw.get_active());
            });
            row.add_suffix(toggle);
            row.set_activatable_widget(toggle);

            // Move up button
            const upButton = new Gtk.Button({
                icon_name: 'go-up-symbolic',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat'],
                sensitive: i > 0,
                tooltip_text: _('Move up'),
            });
            upButton.connect('clicked', () => {
                this._moveAction(actionId, -1);
            });

            // Move down button
            const downButton = new Gtk.Button({
                icon_name: 'go-down-symbolic',
                valign: Gtk.Align.CENTER,
                css_classes: ['flat'],
                sensitive: i < actionOrder.length - 1,
                tooltip_text: _('Move down'),
            });
            downButton.connect('clicked', () => {
                this._moveAction(actionId, 1);
            });

            // Create a box for the reorder buttons
            const buttonBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                spacing: 4,
                valign: Gtk.Align.CENTER,
                margin_start: 8,
            });
            buttonBox.append(upButton);
            buttonBox.append(downButton);
            row.add_suffix(buttonBox);

            this._group.add(row);
            this._rows.push(row);
        }
    }

    _moveAction(actionId, direction) {
        const order = this._settings.get_strv('action-order');
        const index = order.indexOf(actionId);
        if (index < 0) return;

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= order.length) return;

        // Swap
        [order[index], order[newIndex]] = [order[newIndex], order[index]];

        // Block signal to avoid rebuild loop
        if (this._orderChangedId) {
            this._settings.block_signal_handler(this._orderChangedId);
        }
        this._settings.set_strv('action-order', order);
        if (this._orderChangedId) {
            this._settings.unblock_signal_handler(this._orderChangedId);
        }

        this._buildRows();
    }

    _setActionVisibility(actionId, visible) {
        const visibility = this._settings.get_strv('action-visibility');
        const index = visibility.indexOf(actionId);

        if (visible && index < 0) {
            visibility.push(actionId);
        } else if (!visible && index >= 0) {
            visibility.splice(index, 1);
        }

        // Block signal to avoid rebuild loop
        if (this._visibilityChangedId) {
            this._settings.block_signal_handler(this._visibilityChangedId);
        }
        this._settings.set_strv('action-visibility', visibility);
        if (this._visibilityChangedId) {
            this._settings.unblock_signal_handler(this._visibilityChangedId);
        }
    }
}
