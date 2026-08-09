class ColorPalette {
    static getPaletteById = null;

    constructor(name = 'New Palette', colors = [], options = {}) {
        this.name = name;
        this.colors = colors;
        this.element = null;
        this.selectedPatch = null;
        this.menuPopper = null;
        this.pickerPopper = null;
        this.onChange = options.onChange || (() => {});
        this.onDelete = options.onDelete || (() => {});
    }

    createElement() {
        const paletteElement = document.createElement('div');
        paletteElement.className = 'palette';
        paletteElement.id = 'palette-' + Date.now();

        const header = document.createElement('div');
        header.className = 'palette-header';

        const nameInput = document.createElement('input');
        nameInput.className = 'palette-name';
        nameInput.value = this.name;

        const headerActions = document.createElement('div');
        headerActions.className = 'palette-header-actions';

        const addColorBtn = document.createElement('button');
        addColorBtn.className = 'add-button add-color-btn';
        addColorBtn.textContent = '+ Add Color';

        const deletePaletteBtn = document.createElement('button');
        deletePaletteBtn.className = 'delete-palette-btn';
        deletePaletteBtn.textContent = 'Delete Palette';

        headerActions.appendChild(addColorBtn);
        headerActions.appendChild(deletePaletteBtn);

        header.appendChild(nameInput);
        header.appendChild(headerActions);

        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-grid';

        paletteElement.appendChild(header);
        paletteElement.appendChild(colorGrid);

        this.colors.forEach(color => {
            colorGrid.appendChild(this.createColorPatch(color));
        });

        addColorBtn.addEventListener('click', () => this.addColor());
        nameInput.addEventListener('change', (e) => {
            this.name = e.target.value;
            this.onChange();
        });
        deletePaletteBtn.addEventListener('click', () => {
            if (confirm(`Delete palette "${this.name}"?`)) {
                this.onDelete(this);
            }
        });

        this.element = paletteElement;
        this.updateColors();
        this.render();

        return paletteElement;
    }

    createColorPatch(color) {
        const patch = document.createElement('div');
        patch.className = 'color-patch';
        patch.draggable = true;

        const patchContent = document.createElement('div');
        patchContent.className = 'color-patch-content';

        const colorValue = typeof color === 'string' ? color : color.color;
        const colorName = typeof color === 'object' && color.name ? color.name : '';
        patchContent.style.backgroundColor = colorValue;

        const hexColor = rgbToHex(colorValue);
        const isLight = isColorLight(hexColor);
        const textColor = isLight ? 'black' : 'white';

        const ellipsisButton = document.createElement('button');
        ellipsisButton.className = 'ellipsis-button';
        ellipsisButton.style.color = textColor;
        ellipsisButton.textContent = '⋮';
        ellipsisButton.setAttribute('aria-label', 'Color options');
        patchContent.appendChild(ellipsisButton);

        if (colorName) {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'color-name';
            nameSpan.style.color = textColor;
            nameSpan.textContent = colorName;
            patchContent.appendChild(nameSpan);
        }

        const codeSpan = document.createElement('span');
        codeSpan.className = 'color-code';
        codeSpan.style.color = textColor;
        codeSpan.textContent = hexColor;
        patchContent.appendChild(codeSpan);

        patch.appendChild(patchContent);

        ellipsisButton.addEventListener('click', (e) => this.openColorMenu(e, patch));

        patch.addEventListener('dragstart', this.handleDragStart.bind(this));
        patch.addEventListener('dragover', this.handleDragOver.bind(this));
        patch.addEventListener('drop', this.handleDrop.bind(this));
        patch.addEventListener('dragend', this.handleDragEnd.bind(this));
        patch.addEventListener('click', () => this.selectPatch(patch));

        return patch;
    }

    handleDragStart(e) {
        const patch = e.currentTarget;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            paletteId: this.element.id,
            colorIndex: Array.from(patch.parentNode.children).indexOf(patch)
        }));
        patch.style.opacity = '0.5';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        let data;
        try {
            data = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch {
            return;
        }
        if (!data || typeof data.paletteId !== 'string' || typeof data.colorIndex !== 'number') {
            return;
        }

        const fromPaletteId = data.paletteId;
        const fromIndex = data.colorIndex;
        const toIndex = this.getDropIndex(e.target);

        if (fromPaletteId === this.element.id) {
            if (fromIndex !== toIndex) {
                this.moveColor(fromIndex, toIndex);
            }
        } else {
            const fromPalette = ColorPalette.getPaletteById?.(fromPaletteId);
            if (!fromPalette || !fromPalette.colors[fromIndex]) {
                return;
            }
            const colorToCopy = fromPalette.colors[fromIndex];
            this.insertColor(colorToCopy, toIndex);
        }
    }

    handleDragEnd(e) {
        e.currentTarget.style.opacity = '1';
    }

    getDropIndex(target) {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = Array.from(colorGrid.children);

        if (target.classList.contains('color-patch')) {
            return patches.indexOf(target);
        }
        const patchElement = target.closest('.color-patch');
        return patchElement ? patches.indexOf(patchElement) : patches.length;
    }

    moveColor(fromIndex, toIndex) {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = Array.from(colorGrid.children);
        const [removed] = patches.splice(fromIndex, 1);

        if (fromIndex < toIndex) {
            toIndex--;
        }

        patches.splice(toIndex, 0, removed);

        colorGrid.innerHTML = '';
        patches.forEach(patch => colorGrid.appendChild(patch));

        this.notifyChange();
    }

    insertColor(color, index) {
        const colorGrid = this.element.querySelector('.color-grid');
        const newPatch = this.createColorPatch(color);
        const patches = Array.from(colorGrid.children);
        patches.splice(index, 0, newPatch);

        colorGrid.innerHTML = '';
        patches.forEach(patch => colorGrid.appendChild(patch));

        this.notifyChange();
    }

    destroyPopper(instance) {
        if (instance) {
            instance.destroy();
        }
    }

    openColorMenu(event, patch) {
        const menu = document.getElementById('colorMenu');
        const button = event.currentTarget;

        menu.style.display = 'block';

        this.destroyPopper(this.menuPopper);
        this.menuPopper = Popper.createPopper(button, menu, {
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

        openPickerBtn.onclick = () => {
            menu.style.display = 'none';
            this.openColorPicker(patch);
        };
        deleteColorBtn.onclick = () => {
            menu.style.display = 'none';
            this.deleteColor(patch);
        };

        event.stopPropagation();
    }

    closeColorPicker(colorPicker) {
        this.destroyPopper(this.pickerPopper);
        this.pickerPopper = null;
        if (colorPicker.parentNode) {
            colorPicker.parentNode.removeChild(colorPicker);
        }
    }

    openColorPicker(patch) {
        const colorPicker = document.createElement('div');
        colorPicker.className = 'color-picker';
        colorPicker.innerHTML = `
            <input type="color" class="color-picker-input">
            <input type="text" class="color-picker-name" placeholder="Color name (optional)">
            <button class="color-picker-apply">Apply</button>
        `;

        const currentColor = patch.querySelector('.color-patch-content').style.backgroundColor;
        const currentName = patch.querySelector('.color-name')?.textContent || '';

        const colorInput = colorPicker.querySelector('.color-picker-input');
        const colorNameInput = colorPicker.querySelector('.color-picker-name');
        const applyColorBtn = colorPicker.querySelector('.color-picker-apply');

        const originalColor = rgbToHex(currentColor);
        colorInput.value = originalColor;
        colorNameInput.value = currentName;

        let tempColor = originalColor;
        let tempName = currentName;

        colorInput.addEventListener('input', (e) => {
            tempColor = e.target.value;
            this.updatePatchColor(patch, tempColor, tempName, true);
        });

        colorNameInput.addEventListener('input', (e) => {
            tempName = e.target.value;
            this.updatePatchColor(patch, tempColor, tempName, true);
        });

        const finishPicker = (apply) => {
            if (apply) {
                this.updatePatchColor(patch, tempColor, tempName);
            } else {
                this.updatePatchColor(patch, originalColor, currentName);
            }
            document.removeEventListener('click', closeColorPicker);
            document.removeEventListener('keydown', handleEscape);
            this.closeColorPicker(colorPicker);
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                finishPicker(false);
            }
        };

        applyColorBtn.addEventListener('click', () => finishPicker(true));

        document.body.appendChild(colorPicker);

        this.destroyPopper(this.pickerPopper);
        this.pickerPopper = Popper.createPopper(patch, colorPicker, {
            placement: 'bottom-start',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 5],
                    },
                },
                {
                    name: 'preventOverflow',
                    options: {
                        padding: 10,
                    },
                },
            ],
        });

        const closeColorPicker = (e) => {
            if (!colorPicker.contains(e.target) && !patch.contains(e.target)) {
                finishPicker(false);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeColorPicker);
            document.addEventListener('keydown', handleEscape);
        }, 0);
    }

    updatePatchColor(patch, newColor, colorName = '', isTemporary = false) {
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
                const codeElement = patch.querySelector('.color-code');
                patchContent.insertBefore(colorNameElement, codeElement);
            }
            colorNameElement.textContent = colorName;
            colorNameElement.style.color = textColor;
        } else if (colorNameElement) {
            colorNameElement.remove();
        }

        const colorCode = patch.querySelector('.color-code');
        colorCode.textContent = hexColor;
        colorCode.style.color = textColor;
        patch.querySelector('.ellipsis-button').style.color = textColor;

        if (!isTemporary) {
            this.notifyChange();
        }
    }

    deleteColor(patch) {
        const colorGrid = patch.parentElement;
        colorGrid.removeChild(patch);
        if (this.selectedPatch === patch) {
            this.selectedPatch = null;
        }
        this.notifyChange();
    }

    addColor() {
        const newColor = '#000000';
        const colorGrid = this.element.querySelector('.color-grid');
        const newPatch = this.createColorPatch(newColor);
        if (this.selectedPatch) {
            colorGrid.insertBefore(newPatch, this.selectedPatch.nextSibling);
            this.selectPatch(newPatch);
        } else {
            colorGrid.appendChild(newPatch);
        }
        this.notifyChange();
    }

    updateColors() {
        const patches = this.element.querySelectorAll('.color-patch');
        this.colors = Array.from(patches).map(patch => {
            const rawColor = patch.querySelector('.color-patch-content').style.backgroundColor;
            const hex = rgbToHex(rawColor);
            const name = patch.querySelector('.color-name')?.textContent;
            return name ? { color: hex, name } : hex;
        });
    }

    notifyChange() {
        this.updateColors();
        this.render();
        this.onChange();
    }

    adjustPatchSizes() {
        const colorGrid = this.element.querySelector('.color-grid');
        const patches = colorGrid.querySelectorAll('.color-patch');
        const gridWidth = colorGrid.offsetWidth;
        const minPatchWidth = 215;

        if (patches.length === 0) {
            colorGrid.style.height = 'auto';
            return;
        }

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

                const patchHeight = patch.offsetWidth;
                patch.style.height = `${patchHeight}px`;
            } else {
                patch.classList.remove('single-row');
                patch.style.height = 'auto';
            }
        });

        if (patchesPerRow === patches.length) {
            const patchHeight = patches[0].offsetWidth;
            colorGrid.style.height = `${patchHeight}px`;
        } else {
            colorGrid.style.height = 'auto';
        }
    }

    render() {
        this.adjustPatchSizes();
        const patches = this.element.querySelectorAll('.color-patch');
        patches.forEach(patch => {
            patch.style.display = 'block';
        });
    }

    selectPatch(patch) {
        if (this.selectedPatch) {
            this.selectedPatch.classList.remove('selected');
        }
        patch.classList.add('selected');
        this.selectedPatch = patch;
    }
}
