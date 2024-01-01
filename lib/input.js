import { inputCanvas, canvasScale, mousePos } from "./globals.js";

// Hardcoded actions that can be detected.
// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values for all list of key codes.
let actions = {
    leftClick: ["LeftMouseBtn"],
    rightClick: ["RightMouseBtn"],
    softDrop: ["ArrowDown", "s", "S"],
    hardDrop: [" "],
    start: ["Enter"],
    restart: ["Enter","r", "R"],
    left: ["ArrowLeft", "a", "A"],
    right: ["ArrowRight", "d", "D"],
    up: ["ArrowUp", "w", "W"],
    down: ["ArrowDown", "s", "S"],
    uiSelect: [" ", "Enter"],
    rotateCW: ["x", "X"],
    rotateCCW: ["z", "Z"],
    hold: ["c", "C"]
};

// These will be used to keep track of the current keys being pressed 
// and also provide a way to detect released and just pressed keys
let pressedKeys = new Set();
let justPressedKeys = new Set();
let previousKeyState = new Set();

// Call everyframe to update key states.
export function updateInput() {
    justPressedKeys.clear();

    for (const key of pressedKeys) {
        if (!previousKeyState.has(key)) {
            justPressedKeys.add(key);
        }
    }

    previousKeyState.clear();
    for (const key of pressedKeys) {
        previousKeyState.add(key);
    }
}

// Calculate the mouse position in canvas space.
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();

    return {
      x: (evt.clientX - rect.left) / canvasScale,
      y: (evt.clientY - rect.top) / canvasScale
    };
}

export function startInputEvents() {
        // Event listeners for key presses and releases
    window.addEventListener("keydown", (event) => {
        event.preventDefault();
        pressedKeys.add(event.key);
    });
    window.addEventListener("keyup", (event) => {
        event.preventDefault();
        pressedKeys.delete(event.key);
    });

    // Event listerners to mouse movement and button presses.
    inputCanvas.addEventListener('mousemove', (event) => {
        var pos = getMousePos(inputCanvas, event);

        // Update global mouse position with correct canvas space coordinates.
        mousePos.x = pos.x;
        mousePos.y = pos.y;
    });
    inputCanvas.addEventListener("mousedown", (event) => {
        event.preventDefault();
        if(event.button == 0) {
            // left click
            pressedKeys.add("LeftMouseBtn");
        } else if(event.button == 2) {
            // right click
            pressedKeys.add("RightMouseBtn");
        }
    });
    inputCanvas.addEventListener("mouseup", (event) => {
        event.preventDefault();
        if(event.button == 0) {
            // left click
            pressedKeys.delete("LeftMouseBtn");
        } else if(event.button == 2) {
            // right click
            pressedKeys.delete("RightMouseBtn");
        }
    });

    // Disable context menu.
    inputCanvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    })
}


// Interfaces to check actions.
export function isActionPressed(action) {
    for (const key of actions[action]) {
        if (pressedKeys.has(key)) {
            return 1;
        }
    }
    return 0;
}
export function isActionJustPressed(action) {
    for (const key of actions[action]) {
        if (justPressedKeys.has(key)) {
            return 1;
        }
    }
    return 0;
}
export function isActionReleased(action) {
    for (const key of actions[action]) {
        if (previousKeyState.has(key)) {
            return 1;
        }
    }
    return 0;
}