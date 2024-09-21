const defaultColors = ['#000000', '#FF0000', '#000080', '#FFFF00', '#FFFFFF'];
let palettes = [];

function addPalette(name = 'New Palette', colors = [...defaultColors]) {
    const palette = new ColorPalette(name, colors);
    const paletteElement = palette.createElement();
    document.getElementById('palettesContainer').appendChild(paletteElement);
    palettes.push(palette);
    return palette;
}

document.getElementById('addPaletteBtn').addEventListener('click', () => {
    const newPalette = addPalette();
    refreshAllPalettes();
});

function refreshAllPalettes() {
    palettes.forEach(palette => palette.render());
}

// Event listener for palette refresh
document.addEventListener('paletteRefresh', (event) => {
    refreshAllPalettes();
});

function exportConfig() {
    const config = palettes.map(palette => ({
        name: palette.name,
        colors: palette.colors.map(color => {
            if (typeof color === 'string') {
                return color;
            } else {
                return { color: color.color, name: color.name };
            }
        })
    }));
    return JSON.stringify(config, null, 2);
}

function importConfig(configJson) {
    try {
        const config = JSON.parse(configJson);
        document.getElementById('palettesContainer').innerHTML = '';
        palettes = [];
        config.forEach(palette => {
            const colors = palette.colors.map(color => {
                if (typeof color === 'string') {
                    return color;
                } else {
                    return { color: color.color, name: color.name };
                }
            });
            addPalette(palette.name, colors);
        });
        refreshAllPalettes();
    } catch (error) {
        console.error('Invalid configuration:', error);
        alert('Invalid configuration. Please check the format and try again.');
    }
}

// Export button functionality
document.getElementById('exportBtn').addEventListener('click', () => {
    const modal = document.getElementById('exportModal');
    const configTextarea = document.getElementById('configTextarea');
    configTextarea.value = exportConfig();
    modal.style.display = 'block';
});

// Import button functionality
document.getElementById('importBtn').addEventListener('click', () => {
    const modal = document.getElementById('importModal');
    modal.style.display = 'block';
});

document.getElementById('applyImportBtn').addEventListener('click', () => {
    const configJson = document.getElementById('importTextarea').value;
    importConfig(configJson);
    document.getElementById('importModal').style.display = 'none';
});

// Close modal functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Close color menu when clicking outside
document.addEventListener('click', (event) => {
    const colorMenu = document.getElementById('colorMenu');
    if (!event.target.closest('.ellipsis-button') && !event.target.closest('#colorMenu')) {
        colorMenu.style.display = 'none';
    }
});

// Adjust patch sizes on window resize
window.addEventListener('resize', () => {
    refreshAllPalettes();
});

// Initialize with one palette
document.addEventListener('DOMContentLoaded', () => {
    const initialPalette = addPalette();

    // Force a refresh after a short delay to ensure proper rendering
    setTimeout(() => {
        initialPalette.render();
        refreshAllPalettes();
    }, 100);
});

// MutationObserver to watch for changes in the palettes container
const palettesContainer = document.getElementById('palettesContainer');
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            refreshAllPalettes();
        }
    });
});

observer.observe(palettesContainer, { childList: true, subtree: true });
