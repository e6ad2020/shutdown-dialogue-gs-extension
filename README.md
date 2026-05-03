<p align="center">
  <img src="./assets/icon.svg" width="160" height="160" alt="Power Menu Logo">
</p>

<h1 align="center">Power Menu</h1>

<p align="center">
  A modern, interactive power dialogue for GNOME Shell.
  <br>
  Triggered with <b>Alt + F4</b> on the desktop to manage Shutdown, Restart, Suspend, and Log Out.
</p>

<p align="center">
  Built with ❤️ for the GNOME community.
</p>

---

### Features

- **Custom Keybinding:** Overrides the default Alt+F4 to show the dialogue when no windows are open.
- **Modern UI:** Clean, polished design that blends perfectly with GNOME Shell.
- **Customizable:** Reorder or hide actions through the settings menu.
- **Interactive:** Supports both keyboard navigation (arrows) and mouse interaction (hover & click).
- **Localized:** Full support for Arabic, German and English languages.
- **GNOME Ready:** Compatible with GNOME versions 45 up to 50.

---

### Screenshot

<p align="center">
  <img src="./assets/preview.png" alt="Power Menu Preview" width="500">
</p>

---

### Installation

### Automatic Installation

1. Install the extension from the GNOME Extensions website:
    
    [Shutdown Dialogue Extension](https://extensions.gnome.org/extension/9710/power-menu/)
    
    [![Install on GNOME Shell](https://pbs.twimg.com/media/D6s8OS2U8AAaLNQ.png)](https://extensions.gnome.org/extension/9710/power-menu/)


#### Manual Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/e6ad2020/power-menu-gs-extension.git
    ```

2. Navigate to the directory:
    ```sh
    cd power-menu-gs-extension
    ```

3. Install the extension:
    ```sh
    ./install.sh
    ```

4. Restart GNOME Shell:
    - **Wayland:** Log out and log back in.
    - **X11:** Press `Alt+F2`, type `r`, and press `Enter`.

5. Enable the extension using the **Extensions** app.

---

### 💡 Pro Tip: Faster Workflow

Since this extension triggers when no windows are focused (on the desktop), you can make it even faster by setting a shortcut to "Show Desktop":

1. Set **Super + D** to hide all windows:
   ```sh
   gsettings set org.gnome.desktop.wm.keybindings show-desktop "['<Super>d']"
   ```
2. Now you can simply press **Super + D** followed by **Alt + F4** to access the power menu from anywhere!

---

### Usage

- Press **Alt+F4** when no windows are active to trigger the dialogue.
- Use **Arrow Keys** or **Mouse** to select an action.
- Press **Enter** or **Click** to confirm.

---

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
