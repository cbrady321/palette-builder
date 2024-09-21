let palettes = [];

function addPalette(name = 'New Palette', colors = []) {
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
        colors: palette.colors
    }));
    return JSON.stringify(config, null, 2);
}

function importConfig(configJson) {
    try {
        const config = JSON.parse(configJson);
        document.getElementById('palettesContainer').innerHTML = '';
        palettes = [];
        config.forEach(palette => {
            addPalette(palette.name, palette.colors);
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

// Initialize the app
function initializeApp() {
    fetch('default-config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text(); // Get the raw text instead of parsing JSON
        })
        .then(text => {
            console.log("Fetched text:", text); // Log the fetched text
            const data = JSON.parse(text); // Parse the text to JSON
            importConfig(JSON.stringify(data));
        })
        .catch(error => {
            console.error('Error loading default configuration:', error);
            console.error('Error details:', error.message);
            // Fallback to a simple default palette if the file can't be loaded
            importConfig(JSON.stringify([{name: 'Default Palette', colors: ['#000000', '#FF0000', '#0000FF', '#FFFF00', '#FFFFFF']}]));
        });
}

// Call initializeApp when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);

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

// Add copy-paste functionality
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c') {
        const activePalette = palettes.find(p => p.selectedPatch);
        if (activePalette && activePalette.selectedPatch) {
            const selectedPatch = activePalette.selectedPatch;
            const colorData = {
                color: selectedPatch.querySelector('.color-patch-content').style.backgroundColor,
                name: selectedPatch.querySelector('.color-name')?.textContent || ''
            };
            localStorage.setItem('copiedColor', JSON.stringify(colorData));
        }
    } else if (e.ctrlKey && e.key === 'v') {
        const activePalette = palettes.find(p => p.selectedPatch);
        if (activePalette) {
            const copiedColorData = JSON.parse(localStorage.getItem('copiedColor'));
            if (copiedColorData) {
                const newPatch = activePalette.createColorPatch(copiedColorData);
                const selectedPatch = activePalette.selectedPatch;
                const colorGrid = selectedPatch.parentElement;
                const selectedIndex = Array.from(colorGrid.children).indexOf(selectedPatch);
                colorGrid.insertBefore(newPatch, selectedPatch.nextSibling);
                activePalette.selectPatch(newPatch);
                activePalette.updateColors();
                activePalette.render();
                activePalette.triggerRefreshEvent();
            }
        }
    }
});
