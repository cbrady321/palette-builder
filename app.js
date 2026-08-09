const STORAGE_KEY = 'palette-builder-config';
const FALLBACK_CONFIG = [{ name: 'Default Palette', colors: ['#000000', '#FF0000', '#0000FF', '#FFFF00', '#FFFFFF'] }];

let palettes = [];
let lastFocusedElement = null;

function getPaletteById(id) {
    return palettes.find(p => p.element.id === id);
}

function addPalette(name = 'New Palette', colors = []) {
    const palette = new ColorPalette(name, colors, {
        onChange: saveToLocalStorage,
        onDelete: (p) => {
            const idx = palettes.indexOf(p);
            if (idx >= 0) {
                palettes.splice(idx, 1);
            }
            p.element.remove();
            refreshAllPalettes();
            saveToLocalStorage();
        }
    });
    const paletteElement = palette.createElement();
    document.getElementById('palettesContainer').appendChild(paletteElement);
    palettes.push(palette);
    return palette;
}

document.getElementById('addPaletteBtn').addEventListener('click', () => {
    addPalette();
    saveToLocalStorage();
});

function refreshAllPalettes() {
    palettes.forEach(palette => palette.render());
}

function exportConfig() {
    const config = palettes.map(palette => ({
        name: palette.name,
        colors: palette.colors
    }));
    return JSON.stringify(config, null, 2);
}

function validateConfig(data) {
    if (!Array.isArray(data)) {
        throw new Error('Config must be an array');
    }
    data.forEach((palette, i) => {
        if (!palette || typeof palette.name !== 'string') {
            throw new Error(`Palette ${i}: invalid name`);
        }
        if (!Array.isArray(palette.colors)) {
            throw new Error(`Palette ${i}: colors must be an array`);
        }
        palette.colors.forEach((c, j) => {
            const val = typeof c === 'string' ? c : c?.color;
            if (typeof val !== 'string' || !val) {
                throw new Error(`Palette ${i}, color ${j}: invalid color`);
            }
        });
    });
}

function importConfig(configJson, options = {}) {
    try {
        const config = JSON.parse(configJson);
        validateConfig(config);
        document.getElementById('palettesContainer').innerHTML = '';
        palettes = [];
        config.forEach(palette => {
            addPalette(palette.name, palette.colors);
        });
        refreshAllPalettes();
        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('Invalid configuration:', error);
        if (!options.silent) {
            alert('Invalid configuration. Please check the format and try again.');
        }
        return false;
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, exportConfig());
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function openModal(modalId, focusSelector) {
    const modal = document.getElementById(modalId);
    lastFocusedElement = document.activeElement;
    modal.style.display = 'block';
    const focusTarget = modal.querySelector(focusSelector);
    if (focusTarget) {
        focusTarget.focus();
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

document.getElementById('exportBtn').addEventListener('click', () => {
    document.getElementById('configTextarea').value = exportConfig();
    openModal('exportModal', '#configTextarea');
});

document.getElementById('importBtn').addEventListener('click', () => {
    openModal('importModal', '#importTextarea');
});

document.getElementById('applyImportBtn').addEventListener('click', () => {
    const configJson = document.getElementById('importTextarea').value;
    const ok = importConfig(configJson);
    if (ok) {
        closeModal(document.getElementById('importModal'));
    }
});

document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm('Reset all palettes to defaults? This will discard your saved changes.')) {
        return;
    }
    localStorage.removeItem(STORAGE_KEY);
    try {
        const response = await fetch('default-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        importConfig(text, { silent: true });
    } catch (error) {
        console.error('Error loading default configuration:', error);
        importConfig(JSON.stringify(FALLBACK_CONFIG), { silent: true });
    }
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeModal(closeBtn.closest('.modal'));
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

document.addEventListener('click', (event) => {
    const colorMenu = document.getElementById('colorMenu');
    if (!event.target.closest('.ellipsis-button') && !event.target.closest('#colorMenu')) {
        colorMenu.style.display = 'none';
    }
});

window.addEventListener('resize', debounce(refreshAllPalettes, 150));

async function initializeApp() {
    ColorPalette.getPaletteById = getPaletteById;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            validateConfig(JSON.parse(stored));
            if (importConfig(stored, { silent: true })) {
                return;
            }
        } catch (error) {
            console.error('Invalid stored configuration:', error);
        }
    }

    try {
        const response = await fetch('default-config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        importConfig(text, { silent: true });
    } catch (error) {
        console.error('Error loading default configuration:', error);
        importConfig(JSON.stringify(FALLBACK_CONFIG), { silent: true });
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.querySelector('.color-picker')) {
            return;
        }
        const colorMenu = document.getElementById('colorMenu');
        if (colorMenu.style.display === 'block') {
            colorMenu.style.display = 'none';
            return;
        }
        const openModalEl = document.querySelector('.modal[style*="block"]');
        if (openModalEl) {
            closeModal(openModalEl);
        }
        return;
    }

    if (e.target.closest('input, textarea')) {
        return;
    }

    const modKey = e.ctrlKey || e.metaKey;
    if (!modKey) {
        return;
    }

    if (e.key === 'c') {
        const activePalette = palettes.find(p => p.selectedPatch);
        if (activePalette && activePalette.selectedPatch) {
            const selectedPatch = activePalette.selectedPatch;
            const rawColor = selectedPatch.querySelector('.color-patch-content').style.backgroundColor;
            const colorData = {
                color: rgbToHex(rawColor),
                name: selectedPatch.querySelector('.color-name')?.textContent || ''
            };
            localStorage.setItem('copiedColor', JSON.stringify(colorData));
            e.preventDefault();
        }
    } else if (e.key === 'v') {
        const activePalette = palettes.find(p => p.selectedPatch);
        if (activePalette && activePalette.selectedPatch) {
            let copiedColorData;
            try {
                copiedColorData = JSON.parse(localStorage.getItem('copiedColor'));
            } catch {
                return;
            }
            if (copiedColorData) {
                const newPatch = activePalette.createColorPatch(copiedColorData);
                const selectedPatch = activePalette.selectedPatch;
                const colorGrid = selectedPatch.parentElement;
                colorGrid.insertBefore(newPatch, selectedPatch.nextSibling);
                activePalette.selectPatch(newPatch);
                activePalette.notifyChange();
                e.preventDefault();
            }
        }
    }
});
