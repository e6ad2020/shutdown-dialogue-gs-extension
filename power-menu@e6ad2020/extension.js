import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as ModalDialog from 'resource:///org/gnome/shell/ui/modalDialog.js';
import { setKeybinding, removeKeybinding } from './utils/utils.js';

export default class ShutdownDialogueExtension extends Extension {

	enable() {
		this._wmKeybindingsSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.wm.keybindings' });
		this._customKeybindingsSettings = this.getSettings('org.gnome.shell.extensions.power-menu');
		this._disableCloseBinding();
		this._enableCustomAltF4Binding();
		this._selectedOptionIndex = 0;
	}

	disable() {
		this._disableCustomAltF4Binding();
		this._enableCloseBinding();
		this._wmKeybindingsSettings = null;
		this._customKeybindingsSettings = null;
		if (this._watchId) {
			GLib.Source.remove(this._watchId);
			this._watchId = null;
		}
		if (this._dialog) {
			this._dialog.close();
			this._dialog = null;
		}
	}

	_enableCustomAltF4Binding() {
		setKeybinding(this._customKeybindingsSettings, 'custom-alt-f4', ['<Alt>F4']);
		Main.wm.addKeybinding(
			'custom-alt-f4',
			this._customKeybindingsSettings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.NORMAL,
			this._onAltF4Pressed.bind(this)
		);
	}

	_onAltF4Pressed() {
		try {
			const currentTime = global.get_current_time();
			const activeWindow = global.display.get_focus_window();
			const windowTitle = activeWindow ? activeWindow.get_title() : null;

			if (!activeWindow ||
				!windowTitle ||
				windowTitle === '@!0,0;BDHF' ||
				windowTitle.startsWith('Desktop Icons ') ||
				Main.overview.visible) {
				this._showShutdownDialogue();
				return;
			}

			activeWindow.delete(currentTime);
		} catch (error) {
			console.error('[Power Menu] Error:', error);
			this._showShutdownDialogue();
		}
	}

	_showShutdownDialogue() {
		if (this._dialog) {
			this._dialog.close();
			this._dialog = null;
		}

		this._dialog = new ModalDialog.ModalDialog({
			destroyOnClose: false,
			styleClass: 'power-menu',
		});

		const dialog = this._dialog;

		const mainContentBox = new St.BoxLayout({
			vertical: true,
			style_class: 'dialog-content'
		});
		dialog.contentLayout.add_child(mainContentBox);

		const titleLabel = new St.Label({
			text: this.gettext('Select an action:'),
			style_class: 'header-label',
			x_align: Clutter.ActorAlign.CENTER
		});
		mainContentBox.add_child(titleLabel);

		const optionsContainer = new St.BoxLayout({
			vertical: true,
			x_align: Clutter.ActorAlign.CENTER
		});
		mainContentBox.add_child(optionsContainer);

		this._optionItems = [];
		this._selectedOptionIndex = 0;

		const allActions = {
			'poweroff': { name: this.gettext('Shutdown'), icon: 'system-shutdown-symbolic' },
			'suspend': { name: this.gettext('Suspend'), icon: 'weather-clear-night-symbolic' },
			'reboot': { name: this.gettext('Restart'), icon: 'system-reboot-symbolic' },
			'logout': { name: this.gettext('Log Out'), icon: 'system-log-out-symbolic' },
		};

		const actionOrder = this._customKeybindingsSettings.get_strv('action-order');
		const actionVisibility = this._customKeybindingsSettings.get_strv('action-visibility');

		this._options = [];
		for (const actionId of actionOrder) {
			if (actionVisibility.includes(actionId) && allActions[actionId]) {
				this._options.push({
					name: allActions[actionId].name,
					action: actionId,
					icon: allActions[actionId].icon,
				});
			}
		}

		this._options.forEach((option, index) => {
			const itemBox = new St.BoxLayout({
				vertical: false,
				style_class: 'option-item',
				x_align: Clutter.ActorAlign.FILL,
				y_align: Clutter.ActorAlign.CENTER,
				reactive: true,
				track_hover: true,
			});

			itemBox.connect('button-press-event', () => {
				this._selectedOptionIndex = index;
				this._updateOptionStyles();
				dialog.close();
				this._executeAction(option.action);
				return Clutter.EVENT_STOP;
			});

			itemBox.connect('notify::hover', (actor) => {
				if (actor.hover) {
					this._selectedOptionIndex = index;
					this._updateOptionStyles();
				}
			});

			const icon = new St.Icon({
				icon_name: option.icon,
				style_class: 'option-icon',
				icon_size: 24
			});

			icon.set_style('margin-right: 15px; margin-left: 15px;');

			const label = new St.Label({
				text: option.name,
				y_align: Clutter.ActorAlign.CENTER
			});

			itemBox.add_child(icon);
			itemBox.add_child(label);

			optionsContainer.add_child(itemBox);
			this._optionItems.push(itemBox);
		});

		this._updateOptionStyles();

		dialog.setButtons([
			{
				label: this.gettext('OK'),
				action: () => {
					dialog.close();
					this._executeAction(this._options[this._selectedOptionIndex].action);
				},
				key: Clutter.KEY_Return,
				default: true
			},
			{
				label: this.gettext('Cancel'),
				action: () => {
					dialog.close();
				},
				key: Clutter.KEY_Escape
			}
		]);

		dialog.connect('key-press-event', (actor, event) => {
			const symbol = event.get_key_symbol();

			if (symbol === Clutter.KEY_Up) {
				this._selectedOptionIndex = (this._selectedOptionIndex - 1 + this._options.length) % this._options.length;
				this._updateOptionStyles();
				return Clutter.EVENT_STOP;
			} else if (symbol === Clutter.KEY_Down) {
				this._selectedOptionIndex = (this._selectedOptionIndex + 1) % this._options.length;
				this._updateOptionStyles();
				return Clutter.EVENT_STOP;
			}

			return Clutter.EVENT_PROPAGATE;
		});

		dialog.open();
	}

	_updateOptionStyles() {
		this._optionItems.forEach((item, index) => {
			if (index === this._selectedOptionIndex) {
				item.add_style_class_name('option-item-selected');
			} else {
				item.remove_style_class_name('option-item-selected');
			}
		});
	}

	_executeAction(action) {
		if (action === 'logout') {
			const command = ['/usr/bin/gnome-session-quit', '--logout', '--no-prompt'];
			this._spawnCommand(command);
			return;
		}

		const actionMap = {
			'poweroff': 'PowerOff',
			'reboot': 'Reboot',
			'suspend': 'Suspend'
		};
		const method = actionMap[action];

		if (!method) return;

		Gio.bus_get(Gio.BusType.SYSTEM, null, (source, result) => {
			try {
				const connection = Gio.bus_get_finish(result);
				connection.call(
					'org.freedesktop.login1',
					'/org/freedesktop/login1',
					'org.freedesktop.login1.Manager',
					method,
					GLib.Variant.new('(b)', [true]),
					null,
					Gio.DBusCallFlags.NONE,
					-1,
					null,
					(conn, res) => {
						try {
							conn.call_finish(res);
						} catch (e) {
							console.error(`[Power Menu] Failed to call ${method}: ${e.message}`);
						}
					}
				);
			} catch (e) {
				console.error('[Power Menu] Failed to get system bus:', e);
			}
		});
	}

	_spawnCommand(command) {
		const [success, pid] = GLib.spawn_async(
			null,
			command,
			null,
			GLib.SpawnFlags.DO_NOT_REAP_CHILD,
			null
		);
		if (success) {
			if (this._watchId) {
				GLib.Source.remove(this._watchId);
			}
			this._watchId = GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => {
				GLib.spawn_close_pid(pid);
				this._watchId = 0;
			});
		}
	}

	_disableCloseBinding() {
		setKeybinding(this._wmKeybindingsSettings, 'close', []);
	}

	_enableCloseBinding() {
		setKeybinding(this._wmKeybindingsSettings, 'close', ['<Alt>F4']);
	}

	_disableCustomAltF4Binding() {
		setKeybinding(this._customKeybindingsSettings, 'custom-alt-f4', []);
		removeKeybinding('custom-alt-f4');
	}
}
