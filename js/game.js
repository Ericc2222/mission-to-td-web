class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = GameState.MENU;
        
        // Define available planets
        this.planets = [
            new Planet("Moon", 1.62, false),
            new Planet("Mars", 3.72, true),
            new Planet("Earth", 9.81, true),
            new Planet("Europa", 1.315, false),
            new Planet("Mystery Planet X", 0, false)  // Gravity will be randomized
        ];
        this.selectedPlanetIndex = 0;
        this.currentPlanet = this.planets[this.selectedPlanetIndex];
        this.spacecraft = new Spacecraft(WINDOW_WIDTH/4, 100);
        
        // Game loop variables
        this.lastFrameTime = 0;
        this.accumulator = 0;
        this.timeStep = 1000 / FPS; // ms per frame
        
        // Input handling
        this.keys = {};
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Handle one-time key presses
            if (e.code === 'KeyP') {
                this.handleParachuteKey();
            } else if (e.code === 'Enter') {
                this.handleEnterKey();
            } else if (e.code === 'Escape') {
                this.handleEscapeKey();
            } else if (this.state === GameState.PLANET_SELECT) {
                if (e.code === 'ArrowLeft') {
                    this.selectedPlanetIndex = (this.selectedPlanetIndex - 1 + this.planets.length) % this.planets.length;
                } else if (e.code === 'ArrowRight') {
                    this.selectedPlanetIndex = (this.selectedPlanetIndex + 1) % this.planets.length;
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls 
        this.setupTouchControls();
        
        // Set up canvas resize handling
        this.setupResizeHandling();
    }
    
    setupTouchControls() {
        // Touch controls for mobile devices
        const touchThrust = document.getElementById('touch-thrust');
        const touchLeft = document.getElementById('touch-left');
        const touchRight = document.getElementById('touch-right');
        const touchParachute = document.getElementById('touch-parachute');
        const touchAction = document.getElementById('touch-action');
        
        // Helper function for touch events
        const handleTouch = (element, keyCode, startEvent, endEvent) => {
            if (!element) return;
            
            element.addEventListener(startEvent, (e) => {
                e.preventDefault();
                this.keys[keyCode] = true;
                
                // For one-time actions like parachute or enter
                if (keyCode === 'KeyP') {
                    this.handleParachuteKey();
                } else if (keyCode === 'Enter') {
                    this.handleEnterKey();
                }
            });
            
            element.addEventListener(endEvent, (e) => {
                e.preventDefault();
                this.keys[keyCode] = false;
            });
        };
        
        // Add touch events for each control
        if (touchThrust) {
            handleTouch(touchThrust, 'ArrowUp', 'touchstart', 'touchend');
            handleTouch(touchLeft, 'ArrowLeft', 'touchstart', 'touchend');
            handleTouch(touchRight, 'ArrowRight', 'touchstart', 'touchend');
            handleTouch(touchParachute, 'KeyP', 'touchstart', 'touchend');
            handleTouch(touchAction, 'Enter', 'touchstart', 'touchend');
            
            // Also add mouse events for desktop touch testing
            handleTouch(touchThrust, 'ArrowUp', 'mousedown', 'mouseup');
            handleTouch(touchLeft, 'ArrowLeft', 'mousedown', 'mouseup');
            handleTouch(touchRight, 'ArrowRight', 'mousedown', 'mouseup');
            handleTouch(touchParachute, 'KeyP', 'mousedown', 'mouseup');
            handleTouch(touchAction, 'Enter', 'mousedown', 'mouseup');
        }
    }
    
    setupResizeHandling() {
        // Make sure canvas is responsive
        window.addEventListener('resize', () => {
            resizeCanvas(this.canvas);
        });
        
        // Initial canvas sizing - very important
        resizeCanvas(this.canvas);
    }
    
    handleParachuteKey() {
        // Only deploy parachute in playing state
        if (this.state === GameState.PLAYING) {
            this.spacecraft.parachuteDeployed = true;
        }
    }
    
    handleEnterKey() {
        if (this.state === GameState.MENU) {
            this.state = GameState.PLANET_SELECT;
        } else if (this.state === GameState.PLANET_SELECT) {
            this.state = GameState.PLAYING;
            this.currentPlanet = this.planets[this.selectedPlanetIndex];
            this.spacecraft = new Spacecraft(WINDOW_WIDTH/4, 100);
        } else if (this.state === GameState.VICTORY || this.state === GameState.GAME_OVER) {
            if (this.spacecraft.landingEffectTimer <= 0) {
                this.state = GameState.PLANET_SELECT;
                this.spacecraft = new Spacecraft(WINDOW_WIDTH/4, 100);
            }
        }
    }
    
    handleEscapeKey() {
        if (this.state === GameState.PLANET_SELECT) {
            this.state = GameState.MENU;
        }
    }
    
    update() {
        // Update spacecraft state based on keys
        if (this.state === GameState.PLAYING) {
            this.spacecraft.isThrusting = this.keys['ArrowUp'] || false;
            this.spacecraft.movingLeft = this.keys['ArrowLeft'] || false;
            this.spacecraft.movingRight = this.keys['ArrowRight'] || false;
            
            // Update spacecraft
            const landingStatus = this.spacecraft.update(this.currentPlanet);
            
            // Check if we've landed or crashed
            if (landingStatus !== null) {  // We've hit the ground
                if (landingStatus) {  // Safe landing
                    this.state = GameState.VICTORY;
                } else {  // Crash
                    this.state = GameState.GAME_OVER;
                }
            }
        }
    }
    
    drawMenu() {
        this.ctx.fillStyle = BLACK;
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw stars
        drawStars(this.ctx, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw title
        drawText(this.ctx, "Mission to Touch Down", WINDOW_WIDTH/2, 150, {
            fontSize: 74,
            color: WHITE,
            outline: true
        });
        
        // Draw instructions
        const instructions = [
            "Welcome to Space Landing Training!",
            "",
            "Your Mission:",
            "Land the spacecraft safely on the landing pad",
            "",
            "Controls:",
            "↑ UP ARROW = Fire main engine",
            "← LEFT ARROW = Move left",
            "→ RIGHT ARROW = Move right",
            "P KEY = Deploy parachute (when in atmosphere)",
            "ENTER = Select/Confirm",
            "",
            "For a safe landing you need:",
            "- Land slowly (watch your speed!)",
            "- Land precisely on the pad",
            "- Don't run out of fuel!",
            "",
            "Press ENTER to Start",
            "Press ESC for Menu"
        ];
        
        let y = 250;
        for (const line of instructions) {
            drawText(this.ctx, line, WINDOW_WIDTH/2, y, {
                fontSize: 24,
                color: WHITE
            });
            y += 30;
        }
    }
    
    drawGameOver() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw crash message
        drawText(this.ctx, "CRASH!", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50, {
            fontSize: 74,
            color: RED,
            outline: true
        });
        
        // Add crash details
        let detail = "Missed the landing pad!";
        if (this.spacecraft.velocityY >= 2) {
            detail = "Vertical speed too high!";
        } else if (this.spacecraft.velocityX >= 1) {
            detail = "Horizontal speed too high!";
        }
        
        drawText(this.ctx, detail, WINDOW_WIDTH/2, WINDOW_HEIGHT/2, {
            fontSize: 36,
            color: YELLOW
        });
        
        drawText(this.ctx, "Press ENTER to Try Again", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50, {
            fontSize: 36,
            color: WHITE
        });
    }
    
    drawVictory() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw victory message
        drawText(this.ctx, "PERFECT LANDING!", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 - 50, {
            fontSize: 74,
            color: GREEN,
            outline: true
        });
        
        // Add landing stats
        const stats = `Final Speed: ${Math.abs(this.spacecraft.velocityY).toFixed(1)} m/s`;
        drawText(this.ctx, stats, WINDOW_WIDTH/2, WINDOW_HEIGHT/2, {
            fontSize: 36,
            color: GREEN
        });
        
        // Only show "Press ENTER" after landing effect is done
        if (this.spacecraft.landingEffectTimer <= 0) {
            drawText(this.ctx, "Press ENTER to Play Again", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50, {
                fontSize: 36,
                color: WHITE
            });
        }
    }
    
    drawControlsReminder() {
        this.ctx.fillStyle = WHITE;
        this.ctx.font = "24px Arial";
        this.ctx.textAlign = "right";
        
        const controls = [
            "↑: Thrust",
            "←→: Move",
            "P: Parachute"
        ];
        
        let y = WINDOW_HEIGHT - 100;
        for (const control of controls) {
            this.ctx.fillText(control, WINDOW_WIDTH - 20, y);
            y += 25;
        }
    }
    
    drawPlanetSelect() {
        this.ctx.fillStyle = BLACK;
        this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw stars
        drawStars(this.ctx, WINDOW_WIDTH, WINDOW_HEIGHT);
        
        // Draw title
        drawText(this.ctx, "Select Your Landing Site", WINDOW_WIDTH/2, 100, {
            fontSize: 64, // Slightly smaller for better fit on smaller screens
            color: WHITE,
            outline: true
        });
        
        // Draw planet preview
        const planet = this.planets[this.selectedPlanetIndex];
        
        if (!planet) {
            console.error("Planet is undefined: selectedPlanetIndex =", this.selectedPlanetIndex);
            // Draw error message
            drawText(this.ctx, "Error: Planet not found", WINDOW_WIDTH/2, 200, {
                fontSize: 40,
                color: RED
            });
            return;
        }
        
        // Draw planet name
        drawText(this.ctx, planet.name, WINDOW_WIDTH/2, 200, {
            fontSize: 74,
            color: WHITE
        });
        
        // Draw planet description
        let y = 250;
        if (planet.description) {
            for (const line of planet.description.split('\n')) {
                drawText(this.ctx, line, WINDOW_WIDTH/2, y, {
                    fontSize: 36,
                    color: WHITE
                });
                y += 40;
            }
        } else {
            console.error("Planet description is undefined for planet:", planet);
            drawText(this.ctx, "No description available", WINDOW_WIDTH/2, y, {
                fontSize: 36,
                color: YELLOW
            });
        }
        
        // Draw navigation arrows
        if (this.selectedPlanetIndex > 0) {
            drawText(this.ctx, "←", 50, WINDOW_HEIGHT/2, {
                fontSize: 74,
                color: WHITE
            });
        }
        
        if (this.selectedPlanetIndex < this.planets.length - 1) {
            drawText(this.ctx, "→", WINDOW_WIDTH - 50, WINDOW_HEIGHT/2, {
                fontSize: 74,
                color: WHITE
            });
        }
        
        // Draw preview of the planet
        const previewWidth = 400;
        const previewHeight = 200;
        const previewX = (WINDOW_WIDTH - previewWidth) / 2;
        const previewY = 450 - previewHeight / 2;
        
        // Draw preview background
        this.ctx.fillStyle = BLACK;
        this.ctx.fillRect(previewX, previewY, previewWidth, previewHeight);
        
        // Draw atmosphere if present
        if (planet.atmosphereColor) {
            this.ctx.fillStyle = planet.atmosphereColor;
            this.ctx.fillRect(previewX, previewY, previewWidth, previewHeight);
        }
        
        // Draw surface
        this.ctx.fillStyle = planet.surfaceColor;
        this.ctx.fillRect(previewX, previewY + 150, previewWidth, 50);
        
        // Add some surface details
        for (let i = 0; i < 5; i++) {
            const x = previewX + Math.random() * previewWidth;
            const darkerColor = planet.getDarkerColor(planet.surfaceColor, 30);
            this.ctx.fillStyle = darkerColor;
            this.ctx.beginPath();
            this.ctx.arc(x, previewY + 160 + Math.random() * 20, 
                       Math.random() * 5 + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw instructions
        const instructions = [
            "← → Arrow Keys: Change Planet",
            "ENTER: Start Mission",
            "ESC: Back to Menu"
        ];
        
        y = WINDOW_HEIGHT - 150;
        for (const instruction of instructions) {
            drawText(this.ctx, instruction, WINDOW_WIDTH/2, y, {
                fontSize: 24,
                color: WHITE
            });
            y += 30;
        }
    }
    
    drawHUD() {
        try {
            // Background for HUD
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, 10, 200, 160);
            
            // Error check for currentPlanet and spacecraft
            if (!this.currentPlanet || !this.spacecraft) {
                this.ctx.fillStyle = RED;
                this.ctx.font = "20px Arial";
                this.ctx.textAlign = "left";
                this.ctx.fillText("HUD Error: Missing data", 20, 40);
                return;
            }
            
            // Draw altitude
            const altitude = WINDOW_HEIGHT - 
                (this.currentPlanet.surfaceHeight || 100) - 
                this.spacecraft.y;
            
            this.ctx.fillStyle = WHITE;
            this.ctx.font = "20px Arial";
            this.ctx.textAlign = "left";
            this.ctx.fillText(`Height: ${Math.round(altitude)}m`, 20, 40);
            
            // Draw velocity with color feedback
            const velocityX = this.spacecraft.velocityX || 0;
            const velocityY = this.spacecraft.velocityY || 0;
            const velocity = Math.sqrt(velocityX**2 + velocityY**2);
            this.ctx.fillStyle = velocity < 2 ? GREEN : (velocity < 4 ? YELLOW : RED);
            this.ctx.fillText(`Speed: ${Math.abs(velocity).toFixed(1)} m/s`, 20, 80);
            
            // Draw horizontal velocity
            this.ctx.fillStyle = Math.abs(velocityX) < 1 ? GREEN : 
                              (Math.abs(velocityX) < 2 ? YELLOW : RED);
            this.ctx.fillText(`H-Speed: ${Math.abs(velocityX).toFixed(1)} m/s`, 20, 120);
            
            // Draw fuel with color feedback
            const fuel = typeof this.spacecraft.fuel === 'number' ? this.spacecraft.fuel : 0;
            this.ctx.fillStyle = fuel > 50 ? GREEN : 
                              (fuel > 25 ? YELLOW : RED);
            this.ctx.fillText(`Fuel: ${Math.round(fuel)}%`, 20, 160);
        } catch (error) {
            console.error("Error in drawHUD:", error);
            // Draw simplified HUD with error message
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, 10, 200, 50);
            this.ctx.fillStyle = RED;
            this.ctx.font = "16px Arial";
            this.ctx.textAlign = "left";
            this.ctx.fillText("HUD Error: " + error.message, 20, 40);
        }
    }
    
    draw() {
        try {
            // Clear the canvas using the fixed game dimensions
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw different screens based on game state
            switch (this.state) {
                case GameState.MENU:
                    this.drawMenu();
                    break;
                    
                case GameState.PLANET_SELECT:
                    this.drawPlanetSelect();
                    break;
                    
                case GameState.PLAYING:
                case GameState.GAME_OVER:
                case GameState.VICTORY:
                    // Draw background and stars
                    this.ctx.fillStyle = BLACK;
                    this.ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
                    drawStars(this.ctx, WINDOW_WIDTH, WINDOW_HEIGHT);
                    
                    // Check if currentPlanet exists
                    if (this.currentPlanet) {
                        // Draw planet
                        this.currentPlanet.draw(this.ctx);
                    } else {
                        console.error("currentPlanet is undefined in draw method");
                        // Draw a default ground
                        this.ctx.fillStyle = '#555555';
                        this.ctx.fillRect(0, WINDOW_HEIGHT - 100, WINDOW_WIDTH, 100);
                    }
                    
                    // Check if spacecraft exists
                    if (this.spacecraft) {
                        // Draw spacecraft
                        this.spacecraft.draw(this.ctx);
                        
                        // Draw wind indicator if currentPlanet exists
                        if (this.currentPlanet) {
                            this.spacecraft.drawWindIndicator(this.ctx, this.currentPlanet);
                        }
                    } else {
                        console.error("spacecraft is undefined in draw method");
                    }
                    
                    // Draw HUD
                    this.drawHUD();
                    
                    // Draw controls reminder
                    this.drawControlsReminder();
                    
                    // Draw game over or victory screens
                    if (this.state === GameState.GAME_OVER) {
                        this.drawGameOver();
                    } else if (this.state === GameState.VICTORY) {
                        this.drawVictory();
                    }
                    break;
                
                default:
                    console.error("Unknown game state:", this.state);
                    // Draw an error message
                    this.ctx.fillStyle = RED;
                    this.ctx.font = "30px Arial";
                    this.ctx.textAlign = "center";
                    this.ctx.fillText("Error: Unknown game state " + this.state, WINDOW_WIDTH/2, WINDOW_HEIGHT/2);
                    break;
            }
        } catch (error) {
            console.error("Error in game draw method:", error);
            // Draw error message on screen
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = RED;
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Error: " + error.message, this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = "20px Arial";
            this.ctx.fillText("Check the console for details", this.canvas.width/2, this.canvas.height/2 + 50);
        }
    }
    
    gameLoop(currentTime) {
        try {
            // Calculate delta time
            if (!this.lastFrameTime) {
                this.lastFrameTime = currentTime;
            }
            
            // Prevent huge deltaTime values (e.g., after tab was inactive)
            let deltaTime = Math.min(currentTime - this.lastFrameTime, 100);
            this.lastFrameTime = currentTime;
            
            // Accumulate time and update in fixed time steps
            this.accumulator += deltaTime;
            
            // Don't let the accumulator get too big (prevents spiral of death)
            if (this.accumulator > 200) {
                console.warn("Large accumulator value detected, capping at 200ms");
                this.accumulator = 200;
            }
            
            // Fixed timestep updates
            let updateCount = 0;
            const MAX_UPDATES = 5; // Safety limit to prevent infinite loops
            
            while (this.accumulator >= this.timeStep && updateCount < MAX_UPDATES) {
                try {
                    this.update();
                    this.accumulator -= this.timeStep;
                    updateCount++;
                } catch (updateError) {
                    console.error("Error in game update:", updateError);
                    this.accumulator = 0; // Reset accumulator to prevent further updates
                    break;
                }
            }
            
            // Draw the game
            this.draw();
        } catch (error) {
            console.error("Critical error in game loop:", error);
            // Attempt to display error on screen
            try {
                this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = "#FF0000";
                this.ctx.font = "30px Arial";
                this.ctx.textAlign = "center";
                this.ctx.fillText("Critical Error: " + error.message, this.canvas.width/2, this.canvas.height/2);
                this.ctx.font = "20px Arial";
                this.ctx.fillText("The game will restart automatically...", this.canvas.width/2, this.canvas.height/2 + 50);
            } catch (e) {
                // If even the error display fails, just log
                console.error("Failed to display error:", e);
            }
            
            // After a brief timeout, try to restart the game
            setTimeout(() => {
                try {
                    // Reset game state
                    this.state = GameState.MENU;
                    this.spacecraft = new Spacecraft(WINDOW_WIDTH/4, 100);
                    this.lastFrameTime = 0;
                    this.accumulator = 0;
                } catch (e) {
                    console.error("Failed to restart game:", e);
                }
            }, 3000);
        }
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        try {
            console.log("Starting game...");
            
            // Make sure the canvas is properly resized
            resizeCanvas(this.canvas);
            
            // Setup touch controls visibility
            const touchControls = document.querySelector('.touch-controls');
            if (touchControls) {
                if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                    touchControls.style.display = 'flex';
                    console.log("Touch controls enabled");
                }
            }
            
            // Start the game loop
            requestAnimationFrame((time) => this.gameLoop(time));
        } catch (error) {
            console.error("Error starting game:", error);
            alert("Failed to start game: " + error.message);
        }
    }
}