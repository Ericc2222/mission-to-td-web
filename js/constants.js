// Game constants
const WINDOW_WIDTH = 1280;
const WINDOW_HEIGHT = 720;
const FPS = 60;

// Game states
const GameState = {
    MENU: 1,
    PLANET_SELECT: 2,
    PLAYING: 3,
    GAME_OVER: 4,
    VICTORY: 5
};

// Colors
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const BLUE = '#0064FF';
const RED = '#FF3232';
const YELLOW = '#FFFF00';
const GREEN = '#32FF32';
const ORANGE = '#FFA500';

// Create a utility function to draw outlined text
function drawText(ctx, text, x, y, options = {}) {
    const fontSize = options.fontSize || 36;
    const fontFamily = options.fontFamily || 'Arial';
    const color = options.color || WHITE;
    const align = options.align || 'center';
    const baseline = options.baseline || 'middle';
    const outline = options.outline || false;
    const outlineColor = options.outlineColor || BLACK;
    const outlineWidth = options.outlineWidth || 3;
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    
    if (outline) {
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineWidth;
        ctx.strokeText(text, x, y);
    }
    
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

// Utility function to convert degrees to radians
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to handle responsive canvas sizing
function resizeCanvas(canvas) {
    // Prevent canvas from being cleared by keeping the original dimensions
    // Always render at the base resolution - more reliable
    canvas.width = WINDOW_WIDTH;
    canvas.height = WINDOW_HEIGHT;
    
    const container = canvas.parentElement;
    const containerWidth = Math.min(window.innerWidth, container.clientWidth);
    const containerHeight = Math.min(window.innerHeight - 50, container.clientHeight); // Account for controls info
    const containerRatio = containerWidth / containerHeight;
    const gameRatio = WINDOW_WIDTH / WINDOW_HEIGHT;
    
    // Calculate the display size based on container
    let displayWidth, displayHeight;
    if (containerRatio > gameRatio) {
        // Container is wider than game ratio
        displayHeight = containerHeight;
        displayWidth = displayHeight * gameRatio;
    } else {
        // Container is taller than game ratio
        displayWidth = containerWidth;
        displayHeight = displayWidth / gameRatio;
    }
    
    // Set the canvas display size via CSS
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Store scale factor as a global variable for input calculations
    const scaleFactor = displayWidth / WINDOW_WIDTH;
    window.gameScaleFactor = scaleFactor;
    
    return scaleFactor;
}

// Function to draw stars
function drawStars(ctx, width, height) {
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() > 0.95 ? 2 : 1;
        
        ctx.fillStyle = WHITE;
        ctx.fillRect(x, y, size, size);
    }
}