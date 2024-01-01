import { startInputEvents } from "./input.js";
import { Vector2 } from "./math.js";
import { preloadImages } from "./preload.js"

export let inputCanvas = null;
export let [width, height, canvasScale] = [320, 180, 1];

// Filter to disable anti-aliasing
let aaFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#f')`

// Global mouse position updated every frame.
export let mousePos = new Vector2(0, 0);
// Object containing a reference to all loaded images.
export let textures;
// Basic property for state control.
export let gameState = "start";


// Create this div in the html file, this is where all the canvas layers will be pushed to.
const layersDiv = document.getElementById('layers');
export const layers = {};

export function createWindow(w, h, scale) {
    [width, height, canvasScale] = [w, h, scale];

    // Input events need this first canvas layer to operate.
    addLayer("inputCanvas", 999);
    inputCanvas = document.getElementsByTagName("canvas")[0];
    startInputEvents();

    let style = document.createElement('style');
    style.textContent = `
        canvas {
            position: absolute;
            scale: ${canvasScale};
            image-rendering: pixelated;
            font-smooth: never;
            -webkit-font-smoothing: none;
        }
    `;
    document.head.appendChild(style);

    return true;
}
export function setGameState(state) {
    gameState = state;
}
export function addLayer(layerName, zIndex, antialiasing = true) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width * canvasScale;
    canvas.style.height = height * canvasScale;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = zIndex;

    const context = canvas.getContext('2d');
    
    // Make pixel art sprites crisper when scaling and rotating.
    context.imageSmoothingEnabled = false;

    if (!antialiasing) {
        context.filter = aaFilter;
    }

    layers[layerName] = context;

    layersDiv.appendChild(canvas);
}

export async function preloadAll(urls) {
    textures = await preloadImages(urls);
}