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
            if (e.code === 'Space') {
                this.handleSpaceKey();
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
        
        // Make sure canvas is responsive
        window.addEventListener('resize', () => {
            resizeCanvas(this.canvas);
        });
        
        // Initial canvas sizing
        resizeCanvas(this.canvas);
    }
    
    handleSpaceKey() {
        if (this.state === GameState.MENU) {
            this.state = GameState.PLANET_SELECT;
        } else if (this.state === GameState.PLANET_SELECT) {
            this.state = GameState.PLAYING;
            this.currentPlanet = this.planets[this.selectedPlanetIndex];
            this.spacecraft = new Spacecraft(WINDOW_WIDTH/4, 100);
        } else if (this.state === GameState.PLAYING) {
            this.spacecraft.parachuteDeployed = true;
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
            "SPACE = Deploy parachute (when in atmosphere)",
            "",
            "For a safe landing you need:",
            "- Land slowly (watch your speed!)",
            "- Land precisely on the pad",
            "- Don't run out of fuel!",
            "",
            "Press SPACE to Start",
            "Press ESC to Quit"
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
        
        drawText(this.ctx, "Press SPACE to Try Again", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50, {
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
        
        // Only show "Press SPACE" after landing effect is done
        if (this.spacecraft.landingEffectTimer <= 0) {
            drawText(this.ctx, "Press SPACE to Play Again", WINDOW_WIDTH/2, WINDOW_HEIGHT/2 + 50, {
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
            "Space: Parachute"
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
            fontSize: 74,
            color: WHITE,
            outline: true
        });
        
        // Draw planet preview
        const planet = this.planets[this.selectedPlanetIndex];
        
        // Draw planet name
        drawText(this.ctx, planet.name, WINDOW_WIDTH/2, 200, {
            fontSize: 74,
            color: WHITE
        });
        
        // Draw planet description
        let y = 250;
        for (const line of planet.description.split('\n')) {
            drawText(this.ctx, line, WINDOW_WIDTH/2, y, {
                fontSize: 36,
                color: WHITE
            });
            y += 40;
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
            "SPACE: Start Mission",
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
        // Background for HUD
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 10, 200, 160);
        
        // Draw altitude
        const altitude = WINDOW_HEIGHT - this.currentPlanet.surfaceHeight - this.spacecraft.y;
        this.ctx.fillStyle = WHITE;
        this.ctx.font = "20px Arial";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Height: ${Math.round(altitude)}m`, 20, 40);
        
        // Draw velocity with color feedback
        const velocity = Math.sqrt(this.spacecraft.velocityX**2 + this.spacecraft.velocityY**2);
        this.ctx.fillStyle = velocity < 2 ? GREEN : (velocity < 4 ? YELLOW : RED);
        this.ctx.fillText(`Speed: ${Math.abs(velocity).toFixed(1)} m/s`, 20, 80);
        
        // Draw horizontal velocity
        this.ctx.fillStyle = Math.abs(this.spacecraft.velocityX) < 1 ? GREEN : 
                          (Math.abs(this.spacecraft.velocityX) < 2 ? YELLOW : RED);
        this.ctx.fillText(`H-Speed: ${Math.abs(this.spacecraft.velocityX).toFixed(1)} m/s`, 20, 120);
        
        // Draw fuel with color feedback
        this.ctx.fillStyle = this.spacecraft.fuel > 50 ? GREEN : 
                          (this.spacecraft.fuel > 25 ? YELLOW : RED);
        this.ctx.fillText(`Fuel: ${Math.round(this.spacecraft.fuel)}%`, 20, 160);
    }
    
    draw() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        
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
                
                // Draw planet
                this.currentPlanet.draw(this.ctx);
                
                // Draw spacecraft
                this.spacecraft.draw(this.ctx);
                
                // Draw HUD
                this.drawHUD();
                
                // Draw wind indicator
                this.spacecraft.drawWindIndicator(this.ctx, this.currentPlanet);
                
                // Draw controls reminder
                this.drawControlsReminder();
                
                // Draw game over or victory screens
                if (this.state === GameState.GAME_OVER) {
                    this.drawGameOver();
                } else if (this.state === GameState.VICTORY) {
                    this.drawVictory();
                }
                break;
        }
    }
    
    gameLoop(currentTime) {
        // Calculate delta time
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Accumulate time and update in fixed time steps
        this.accumulator += deltaTime;
        while (this.accumulator >= this.timeStep) {
            this.update();
            this.accumulator -= this.timeStep;
        }
        
        // Draw the game
        this.draw();
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        // Start the game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}