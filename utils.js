function rgbToHex(color) {
    if (!color || typeof color !== 'string') {
        return '#000000';
    }
    if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
            return '#' + hex.toUpperCase();
        }
        return '#000000';
    }
    const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgb) {
        const r = parseInt(rgb[1], 10);
        const g = parseInt(rgb[2], 10);
        const b = parseInt(rgb[3], 10);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    return '#000000';
}

function isColorLight(color) {
    const hex = rgbToHex(color).replace('#', '');
    if (hex.length !== 6) {
        return false;
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return false;
    }
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 155;
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
