# Color Palette Builder

## Overview

Color Palette Builder is a web-based application that allows users to create, manage, and export color palettes. It's designed for designers, artists, and anyone who needs to work with color schemes in their projects.

## Features

- Create multiple color palettes
- Add, edit, and delete colors within each palette
- Delete entire palettes
- Name individual colors for easy reference
- Automatic adjustment of color patch sizes for optimal viewing
- Real-time color picker for precise color selection
- Export and import palette configurations for easy sharing and backup
- Automatic localStorage persistence across page refreshes
- Copy/paste colors with keyboard shortcuts
- Drag-and-drop to reorder colors or copy between palettes
- Responsive design that works on various screen sizes

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local web server (required for loading default configuration via fetch)

### Installation

1. Download the project files to your local machine.
2. Start a local server from the project directory, for example:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your web browser.

## Usage

### First Load

On first open, the app loads palettes from `default-config.json`. After you make changes, your palettes are saved automatically to browser localStorage and restored on refresh.

### Creating a New Palette

Click the **+ Add Palette** button to create an additional palette.

### Adding Colors to a Palette

1. In a palette, click **+ Add Color**.
2. A new color patch is added with a default black color, inserted after the currently selected patch if one is selected.

### Editing a Color

1. Click the **⋮** (ellipsis) button on a color patch.
2. Select **Open Color Picker** from the menu.
3. Choose a color and optionally enter a name.
4. Click **Apply** to save, or click outside the picker to cancel.
5. Press **Escape** to cancel the picker, close the color menu, or close a modal.

### Deleting a Color

1. Click the **⋮** button on a color patch.
2. Select **Delete Color**.

### Deleting a Palette

Click **Delete Palette** in the palette header and confirm the dialog.

### Copy and Paste

1. Click a color patch to select it (green outline).
2. Press **Ctrl+C** (Windows/Linux) or **Cmd+C** (Mac) to copy the color.
3. Select a patch in the target palette and press **Ctrl+V** or **Cmd+V** to paste after it.

Shortcuts are disabled while typing in input fields.

### Drag and Drop

- **Within a palette:** drag a patch to reorder colors.
- **Between palettes:** drag a patch to another palette to **copy** the color (the source palette keeps the original).

### Exporting Palettes

1. Click **Export**.
2. Copy the JSON from the modal or save it to a file.

### Importing Palettes

1. Click **Import**.
2. Paste a previously exported JSON configuration.
3. Click **Apply**. The modal stays open if the JSON is invalid; existing palettes are preserved on failure.

### Reset to Defaults

Click **Reset to Defaults** to clear saved localStorage data and reload palettes from `default-config.json`.

## Tips

- Color patches automatically resize to fit the screen width while maintaining a minimum size.
- In single-row palettes, patches maintain a square aspect ratio.
- Color names are optional but helpful for organization.
- Exported colors are stored as normalized hex values.
- Use export to backup palettes or share them with others.

## Dependencies

- [Popper.js](https://popper.js.org/) v2.11.8, loaded from unpkg CDN for positioning the color menu and picker.

## Troubleshooting

- If palettes do not load, ensure you are using a local web server (not opening `index.html` directly as a file).
- If colors are not displaying correctly, try refreshing the page.
- If import fails, ensure the JSON format matches the export format.
- Use **Reset to Defaults** to recover from corrupted localStorage data.
- For persistent issues, clear your browser cache and reload.

## Contributing

This is an open-source project. If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License — see the [LICENSE.md](LICENSE.md) file for details.
