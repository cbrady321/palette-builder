class ColorPalette {
    constructor(name = 'New Palette', colors = [...defaultColors]) {
        this.name = name;
        this.colors = colors;
        this.element = null;
        this.selectedPatch = null;
    }

    createElement() {
        const paletteElement = document.createElement('div');
        paletteElement.className = 'palette';
        paletteElement.id = 'palette-' + Date.now(); // Add a unique id
        paletteElement.innerHTML = `
            <div class="palette-header">
                <input class="palette-name" value="${this.name}">
                <button class="add-button add-color-btn">+ Add Color</button>
            </div>
            <div class="color-grid"></div>
        `;

        const colorGrid = paletteElement.querySelector('.color-grid');
        this.colors.forEach(color => {
            colorGrid.appendChild(this.createColorPatch(color));
        });

        paletteElement.querySelector('.add-color-btn').addEventListener('click', () => this.addColor());
        paletteElement.querySelector('.palette-name').addEventListener('change', (e) => this.name = e.target.value);

        this.element = paletteElement;
        this.render();

        return paletteElement;
    }

    createColorPatch(color) {
        const patch = document.createElement('div');
        patch.className = 'color-patch';
        patch.draggable = true;

        const patchContent = document.createElement('div');
        patchContent.className = 'color-patch-content';

        // Ensure the color is in the correct format
        const colorValue = typeof color === 'string' ? color : color.color;
        patchContent.style.backgroundColor = colorValue;

        const hexColor = rgbToHex(colorValue);
        const isLight = isColorLight(hexColor);
        const textColor = isLight ? 'black' : 'white';

        patchContent.innerHTML = `
            <button class="ellipsis-button" style="color: ${textColor};">⋮</button>
            ${color.name ? `<span class="color-name" style="color: ${textColor};">${color.name}</span>` : ''}
            <span class="color-code" style="color: ${textColor};">${hexColor}</span>
        `;
        patch.appendChild(patchContent);

        const ellipsisButton = patchContent.querySelector('.ellipsis-button');
        ellipsisButton.addEventListener('click', (e) => this.openColorMenu(e, patch));

        patch.addEventListener('dragstart', this.handleDragStart.bind(this));
        patch.addEventListener('dragover', this.handleDragOver.bind(this));
        patch.addEventListener('drop', this.handleDrop.bind(this));
        patch.addEventListener('dragend', this.handleDragEnd.bind(this));
        patch.addEventListener('click', () => this.selectPatch(patch));

        return patch;
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            paletteId: this.element.id,
            colorIndex: Array.from(e.target.parentNode.children).indexOf(e.target)
        }));
        e.target.style.opacity = '0.5';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const fromPaletteId = data.paletteId;
        const fromIndex = data.colorIndex;
        const toPalette = this;
        const toIndex = this.getDropIndex(e.target);

        if (fromPaletteId === this.element.id) {
            // Same palette: move color
            if (fromIndex !== toIndex) {
                this.moveColor(fromIndex, toIndex);
            }
        } else {
            // Different palette: copy color
            const fromPalette = palettes.find(p => p.element.id === fromPaletteId);
            const colorToCopy = fromPalette.colors[fromIndex];
            toPalette.insertColor(colorToCopy, toIndex);
        }
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }

    getDropIndex(target) {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = Array.from(colorGrid.children);

        if (target.classList.contains('color-patch')) {
            return patches.indexOf(target);
        } else {
            const patchElement = target.closest('.color-patch');
            return patchElement ? patches.indexOf(patchElement) : patches.length;
        }
    }

    moveColor(fromIndex, toIndex) {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = Array.from(colorGrid.children);
        const [removed] = patches.splice(fromIndex, 1);

        if (fromIndex < toIndex) {
            toIndex--; // Adjust for the removed item
        }

        patches.splice(toIndex, 0, removed);

        colorGrid.innerHTML = '';
        patches.forEach(patch => colorGrid.appendChild(patch));

        this.updateColors();
        this.render();
        this.triggerRefreshEvent();
    }

    insertColor(color, index) {
        const colorGrid = this.element.querySelector('.color-grid');
        const newPatch = this.createColorPatch(color);
        const patches = Array.from(colorGrid.children);
        patches.splice(index, 0, newPatch);

        colorGrid.innerHTML = '';
        patches.forEach(patch => colorGrid.appendChild(patch));

        this.updateColors();
        this.render();
        this.triggerRefreshEvent();
    }

    openColorMenu(event, patch) {
        const menu = document.getElementById('colorMenu');
        const button = event.target;

        menu.style.display = 'block';

        Popper.createPopper(button, menu, {
            placement: 'bottom-start',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 5],
                    },
                },
            ],
        });

        const openPickerBtn = document.getElementById('openPickerBtn');
        const deleteColorBtn = document.getElementById('deleteColorBtn');

        openPickerBtn.onclick = () => this.openColorPicker(patch);
        deleteColorBtn.onclick = () => this.deleteColor(patch);

        event.stopPropagation();
    }

    openColorPicker(patch) {
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        colorPicker.innerHTML = `
            <input type="color" id="colorInput">
            <input type="text" id="colorNameInput" placeholder="Color name (optional)">
            <button id="applyColorBtn">Apply</button>
        `;

        const currentColor = patch.querySelector('.color-patch-content').style.backgroundColor;
        const currentName = patch.querySelector('.color-name')?.textContent || '';

        const colorInput = colorPicker.querySelector('#colorInput');
        const colorNameInput = colorPicker.querySelector('#colorNameInput');
        const applyColorBtn = colorPicker.querySelector('#applyColorBtn');

        colorInput.value = rgbToHex(currentColor);
        colorNameInput.value = currentName;

        colorInput.addEventListener('input', (e) => {
            this.updatePatchColor(patch, e.target.value, colorNameInput.value);
        });

        applyColorBtn.addEventListener('click', () => {
            this.updatePatchColor(patch, colorInput.value, colorNameInput.value);
            document.body.removeChild(colorPicker);
        });

        document.body.appendChild(colorPicker);

        const rect = patch.getBoundingClientRect();
        colorPicker.style.position = 'absolute';
        colorPicker.style.left = `${rect.left}px`;
        colorPicker.style.top = `${rect.bottom + 5}px`;
    }

    updatePatchColor(patch, newColor, colorName = '') {
        const patchContent = patch.querySelector('.color-patch-content');
        patchContent.style.backgroundColor = newColor;
        const hexColor = rgbToHex(newColor);
        const isLight = isColorLight(hexColor);
        const textColor = isLight ? 'black' : 'white';

        let colorNameElement = patch.querySelector('.color-name');
        if (colorName) {
            if (!colorNameElement) {
                colorNameElement = document.createElement('span');
                colorNameElement.className = 'color-name';
                patchContent.insertBefore(colorNameElement, patchContent.firstChild);
            }
            colorNameElement.textContent = colorName;
            colorNameElement.style.color = textColor;
        } else if (colorNameElement) {
            patchContent.removeChild(colorNameElement);
        }

        const colorCode = patch.querySelector('.color-code');
        colorCode.textContent = hexColor;
        colorCode.style.color = textColor;
        patch.querySelector('.ellipsis-button').style.color = textColor;

        this.updateColors();
        this.render();
        this.triggerRefreshEvent();
    }

    deleteColor(patch) {
        const colorGrid = patch.parentElement;
        colorGrid.removeChild(patch);
        this.updateColors();
        this.render();
        this.triggerRefreshEvent();
    }

    addColor() {
        const newColor = '#000000';
        const colorGrid = this.element.querySelector('.color-grid');
        const newPatch = this.createColorPatch(newColor);
        if (this.selectedPatch) {
            const index = Array.from(colorGrid.children).indexOf(this.selectedPatch);
            colorGrid.insertBefore(newPatch, this.selectedPatch.nextSibling);
            this.selectPatch(newPatch);
        } else {
            colorGrid.appendChild(newPatch);
        }
        this.updateColors();
        this.render();
        this.triggerRefreshEvent();
    }

    updateColors() {
        const patches = this.element.querySelectorAll('.color-patch');
        this.colors = Array.from(patches).map(patch => {
            const color = patch.querySelector('.color-patch-content').style.backgroundColor;
            const name = patch.querySelector('.color-name')?.textContent;
            return name ? { color, name } : color;
        });
    }

    adjustPatchSizes() {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = colorGrid.querySelectorAll('.color-patch');
        const gridWidth = colorGrid.offsetWidth;
        const minPatchWidth = 215; // Minimum width before overflow

        let patchesPerRow = Math.floor(gridWidth / minPatchWidth);
        patchesPerRow = Math.min(patchesPerRow, patches.length);
        patchesPerRow = Math.max(patchesPerRow, 1);

        const patchWidth = Math.floor(gridWidth / patchesPerRow);

        patches.forEach(patch => {
            patch.style.flexBasis = `${patchWidth}px`;
            patch.style.maxWidth = `${patchWidth}px`;

            if (patchesPerRow === patches.length) {
                patch.classList.add('single-row');
                const maxWidth = `${100 / patches.length}%`;
                patch.style.flexBasis = maxWidth;
                patch.style.maxWidth = maxWidth;

                // Ensure the height is at least equal to the width
                const patchHeight = patch.offsetWidth;
                patch.style.height = `${patchHeight}px`;
            } else {
                patch.classList.remove('single-row');
                patch.style.height = 'auto'; // Reset height for multi-row layout
            }
        });

        // Adjust container height for single row
        if (patchesPerRow === patches.length) {
            const patchHeight = patches[0].offsetWidth;
            colorGrid.style.height = `${patchHeight}px`;
        } else {
            colorGrid.style.height = 'auto';
        }
    }

    render() {
        this.adjustPatchSizes();
        // Ensure all patches are visible
        const patches = this.element.querySelectorAll('.color-patch');
        patches.forEach(patch => {
            patch.style.display = 'block';
        });
    }

    triggerRefreshEvent() {
        // Dispatch a custom event to notify that a refresh is needed
        const event = new CustomEvent('paletteRefresh', { detail: { palette: this } });
        document.dispatchEvent(event);
    }

    selectPatch(patch) {
        if (this.selectedPatch) {
            this.selectedPatch.classList.remove('selected');
        }
        patch.classList.add('selected');
        this.selectedPatch = patch;
    }
}
