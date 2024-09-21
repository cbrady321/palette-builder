# Color Palette Builder

## Overview

Color Palette Builder is a web-based application that allows users to create, manage, and export color palettes. It's designed for designers, artists, and anyone who needs to work with color schemes in their projects.

## Features

- Create multiple color palettes
- Add, edit, and delete colors within each palette
- Name individual colors for easy reference
- Automatic adjustment of color patch sizes for optimal viewing
- Real-time color picker for precise color selection
- Export and import palette configurations for easy sharing and backup
- Responsive design that works on various screen sizes

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No additional software installation is required

### Installation

1. Download the project files to your local machine.
2. Unzip the files if they are in a compressed format.
3. Open the `index.html` file in your web browser.

## Usage

### Creating a New Palette

1. When you first open the application, you'll see an empty palette.
2. Click the "+ Add Palette" button to create additional palettes.

### Adding Colors to a Palette

1. In a palette, click the "+ Add Color" button.
2. A new color patch will be added with a default black color.

### Editing a Color

1. Click the "⋮" (ellipsis) button on a color patch.
2. Select "Open Color Picker" from the menu.
3. Use the color picker to choose your desired color.
4. Optionally, enter a name for the color in the text field.
5. Click "Apply" to save your changes.

### Deleting a Color

1. Click the "⋮" (ellipsis) button on a color patch.
2. Select "Delete Color" from the menu.

### Exporting Palettes

1. Click the "Export" button at the top of the page.
2. A modal will appear with a JSON representation of your palettes.
3. Copy this JSON or save it to a file for later use.

### Importing Palettes

1. Click the "Import" button at the top of the page.
2. Paste a previously exported JSON configuration into the text area.
3. Click "Apply" to load the imported palettes.

## Tips

- The color patches will automatically resize to fit the screen width while maintaining a minimum size for usability.
- In single-row palettes, color patches will maintain a square aspect ratio for optimal viewing.
- Color names are optional but can be helpful for organizing and remembering specific colors.
- Use the export feature to backup your palettes or share them with others.

## Troubleshooting

- If colors are not displaying correctly, try refreshing the page.
- If the import function fails, ensure that the JSON format is correct and matches the export format.
- For any persistent issues, try clearing your browser cache and reloading the page.

## Contributing

This is an open-source project. If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

---

We hope you enjoy using the Color Palette Builder! If you have any questions or feedback, please don't hesitate to reach out.