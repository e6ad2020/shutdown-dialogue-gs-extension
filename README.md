# Power Menu

This GNOME Shell extension provides a custom keybinding (default Alt+F4) to show a power dialogue (Shutdown, Restart, Suspend, Log Out) when no windows are open.

# Screenshots

![Power Menu](./assets/icon.svg)

![Preview](./assets/preview.png)

## Features

- Overrides the default Alt+F4 keybinding.
- Shows a notification when Alt+F4 is pressed and no windows are open.
- Restores the original keybinding when the extension is disabled.
- Customizable action order and visibility in settings.
- Mouse support (hover selection and click confirmation).
- Supports GNOME 45 up to 50.

## Installation

### Manual Installation

1. Clone the repository to your local machine:
    ```sh
    git clone https://github.com/e6ad2020/power-menu-gs-extension.git
    ```

2. Navigate to the extension directory:
    ```sh
    cd shutdown-dialogue-gs-extension
    ```

3. Install the extension:
    ```sh
    ./install.sh
    ```

4. Restart GNOME Shell:
    - **Wayland:** Log out and log back in.
    - **X11:** Press Alt+F2, type 'r', and press Enter.

5. Enable the extension using GNOME Extensions app.

## Usage

- Press Alt+F4 to trigger the power dialogue when no windows are open.
- Use arrow keys or mouse to select an action.
- Press Enter or click to confirm.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.