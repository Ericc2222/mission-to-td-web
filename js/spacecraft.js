class Spacecraft {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocityY = 0;
        this.velocityX = Math.random() * 4 - 2; // Initial random orbital velocity
        this.angle = 0; // Always upright
        this.thrustPower = 0.5;
        this.horizontalPower = 0.3; // Power for left/right movement
        this.fuel = 50;
        this.width = 40;
        this.height = 60;
        this.isThrusting = false;
        this.movingLeft = false;
        this.movingRight = false;
        this.parachuteDeployed = false;
        this.landed = false;
        this.landingEffectTimer = 0;
        this.fuelWarningTimer = 0;
        this.currentPlanet = null; // Reference to the current planet
    }

    applyThrust() {
        if (this.fuel > 0 && this.isThrusting && !this.landed) {
            // Thrust is always upward
            this.velocityY -= this.thrustPower;
            this.fuel -= 0.1; // Reduced fuel consumption for better playability

            // Play thrust sound
            const thrustSound = document.getElementById('thrust-sound');
            if (thrustSound && thrustSound.paused) {
                thrustSound.currentTime = 0;
                thrustSound.play().catch(e => console.log("Error playing sound: ", e));
            }

            // Update warning timer when fuel is low
            if (this.fuel <= 10) {
                this.fuelWarningTimer = 30;
            }
        } else if (!this.isThrusting) {
            // Stop thrust sound when not thrusting
            const thrustSound = document.getElementById('thrust-sound');
            if (thrustSound && !thrustSound.paused) {
                thrustSound.pause();
            }
        }
    }

    applyHorizontalMovement() {
        if (this.landed) {
            return;
        }

        // Apply horizontal movement based on input
        if (this.movingLeft && this.fuel > 0) {
            this.velocityX -= this.horizontalPower;
            this.fuel -= 0.05; // Less fuel usage for horizontal movement
        }
        if (this.movingRight && this.fuel > 0) {
            this.velocityX += this.horizontalPower;
            this.fuel -= 0.05; // Less fuel usage for horizontal movement
        }
    }

    update(planet) {
        // Store reference to current planet
        this.currentPlanet = planet;
        
        if (this.landed) {
            if (this.landingEffectTimer > 0) {
                this.landingEffectTimer--;
            }
            return null;
        }

        // Update fuel warning timer
        if (this.fuelWarningTimer > 0) {
            this.fuelWarningTimer--;
        }

        // Apply gravity
        this.velocityY += planet.gravity * 0.016; // 1/60th of a second

        // Apply wind force if there's atmosphere
        if (planet.hasAtmosphere) {
            // Wind effect is stronger at higher altitudes
            const altitudeFactor = Math.min(1.0, (WINDOW_HEIGHT - this.y) / WINDOW_HEIGHT);
            const effectiveWind = planet.windForce * altitudeFactor;
            this.velocityX += effectiveWind * 0.016;
            
            // Simple air resistance
            this.velocityX *= 0.99; // Slight horizontal drag
            this.velocityY *= 0.99; // Slight vertical drag
        }

        // Apply atmospheric drag if planet has atmosphere and parachute is deployed
        if (planet.hasAtmosphere && this.parachuteDeployed) {
            const drag = 0.02;
            this.velocityY *= (1 - drag);
            this.velocityX *= (1 - drag);
        }

        // Apply thrust
        this.applyThrust();

        // Apply horizontal movement
        this.applyHorizontalMovement();

        // Update horizontal position
        this.x += this.velocityX;
        
        // Keep spacecraft in bounds with bounce effect
        if (this.x < this.width/2) {
            this.x = this.width/2;
            this.velocityX = Math.abs(this.velocityX) * 0.5;
        } else if (this.x > WINDOW_WIDTH - this.width/2) {
            this.x = WINDOW_WIDTH - this.width/2;
            this.velocityX = -Math.abs(this.velocityX) * 0.5;
        }

        // Update vertical position and check for landing
        const groundY = WINDOW_HEIGHT - planet.surfaceHeight;
        const nextY = this.y + this.velocityY;
        
        if (nextY + this.height/2 >= groundY) {
            // We've hit the ground
            this.y = groundY - this.height/2;
            
            // Check if we're on the landing pad
            const onPad = Math.abs(this.x - planet.landingPadX) < planet.landingPadWidth/2;
            
            // Check for safe landing
            if (Math.abs(this.velocityY) < 2 && // Vertical speed ok
                Math.abs(this.velocityX) < 1 && // Horizontal speed ok
                onPad) {                      // On the pad
                this.landed = true;
                this.landingEffectTimer = 60;
                this.velocityY = 0;
                this.velocityX = 0;
                
                // Play victory sound
                const victorySound = document.getElementById('victory-sound');
                if (victorySound) {
                    victorySound.currentTime = 0;
                    victorySound.play().catch(e => console.log("Error playing sound: ", e));
                }
                
                return true; // Safe landing
            } else {
                this.velocityY = 0; // Stop vertical movement on crash
                this.velocityX = 0; // Stop horizontal movement on crash
                
                // Play crash sound
                const crashSound = document.getElementById('crash-sound');
                if (crashSound) {
                    crashSound.currentTime = 0;
                    crashSound.play().catch(e => console.log("Error playing sound: ", e));
                }
                
                return false; // Crash
            }
        } else {
            this.y = nextY;
            return null; // Still flying
        }
    }

    draw(ctx) {
        // Draw fuel warning when low
        if (this.fuel <= 10 && this.fuelWarningTimer > 0 && !this.landed) {
            ctx.fillStyle = RED;
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText("LOW FUEL!", WINDOW_WIDTH/2, 50);
        }

        // Draw landing effect if just landed
        if (this.landed && this.landingEffectTimer > 0) {
            // Draw expanding circle
            const effectRadius = (60 - this.landingEffectTimer) * 2;
            const effectAlpha = this.landingEffectTimer / 60;
            ctx.strokeStyle = `rgba(50, 255, 50, ${effectAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.height/2, effectRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw the spacecraft body
        const points = [
            { x: this.x - this.width/3, y: this.y + this.height/2 },  // Bottom left
            { x: this.x + this.width/3, y: this.y + this.height/2 },  // Bottom right
            { x: this.x + this.width/4, y: this.y },                  // Middle right
            { x: this.x, y: this.y - this.height/2 },                 // Top
            { x: this.x - this.width/4, y: this.y },                  // Middle left
        ];
        
        // No rotation needed since spacecraft is always upright in this game
        
        // Draw the spacecraft body
        ctx.fillStyle = WHITE;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw the outline
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw landing legs when close to ground or landed
        const groundY = this.currentPlanet ? WINDOW_HEIGHT - this.currentPlanet.surfaceHeight : WINDOW_HEIGHT - 150;
        if (this.y + this.height/2 >= groundY - 100 || this.landed) {
            const legLength = 15;
            const leftLegStart = points[0];  // Bottom left point
            const rightLegStart = points[1];  // Bottom right point
            
            // Left leg
            const leftLegEnd = { x: leftLegStart.x - 10, y: leftLegStart.y + legLength };
            ctx.strokeStyle = BLUE;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(leftLegStart.x, leftLegStart.y);
            ctx.lineTo(leftLegEnd.x, leftLegEnd.y);
            ctx.stroke();
            
            // Right leg
            const rightLegEnd = { x: rightLegStart.x + 10, y: rightLegStart.y + legLength };
            ctx.beginPath();
            ctx.moveTo(rightLegStart.x, rightLegStart.y);
            ctx.lineTo(rightLegEnd.x, rightLegEnd.y);
            ctx.stroke();
        }

        // Draw thrust flame when thrusting
        if (this.isThrusting && this.fuel > 0 && !this.landed) {
            const flamePoints = [
                { x: this.x - this.width/4, y: this.y + this.height/2 },
                { x: this.x + this.width/4, y: this.y + this.height/2 },
                { x: this.x, y: this.y + this.height/2 + 20 }
            ];
            
            ctx.fillStyle = ORANGE;
            ctx.beginPath();
            ctx.moveTo(flamePoints[0].x, flamePoints[0].y);
            ctx.lineTo(flamePoints[1].x, flamePoints[1].y);
            ctx.lineTo(flamePoints[2].x, flamePoints[2].y);
            ctx.closePath();
            ctx.fill();
        }

        // Draw parachute if deployed
        if (this.parachuteDeployed && !this.landed) {
            const parachuteTop = { x: this.x, y: this.y - this.height };
            const parachuteLeft = { x: this.x - this.width, y: this.y - this.height/2 };
            const parachuteRight = { x: this.x + this.width, y: this.y - this.height/2 };
            
            ctx.fillStyle = RED;
            ctx.beginPath();
            ctx.moveTo(parachuteLeft.x, parachuteLeft.y);
            ctx.lineTo(parachuteTop.x, parachuteTop.y);
            ctx.lineTo(parachuteRight.x, parachuteRight.y);
            ctx.closePath();
            ctx.fill();
            
            // Draw parachute lines
            ctx.strokeStyle = WHITE;
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Left line
            ctx.moveTo(parachuteLeft.x, parachuteLeft.y);
            ctx.lineTo(this.x, this.y - this.height/2);
            // Right line
            ctx.moveTo(parachuteRight.x, parachuteRight.y);
            ctx.lineTo(this.x, this.y - this.height/2);
            // Middle line
            ctx.moveTo(parachuteTop.x, parachuteTop.y);
            ctx.lineTo(this.x, this.y - this.height/2);
            ctx.stroke();
        }
    }

    drawWindIndicator(ctx, planet) {
        if (!planet.hasAtmosphere) {
            return;
        }
            
        // Draw wind direction and strength
        const windX = 20;
        const windY = 140;
        const windLength = Math.abs(planet.windForce) * 200;
        const windColor = Math.abs(planet.windForce) < 0.1 ? GREEN : 
                         (Math.abs(planet.windForce) < 0.2 ? YELLOW : RED);
        
        // Draw wind label
        ctx.fillStyle = WHITE;
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Wind:', windX, windY - 15);
        
        // Draw wind arrow
        if (planet.windForce !== 0) {
            const direction = planet.windForce > 0 ? 1 : -1;
            
            // Draw line
            ctx.strokeStyle = windColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(windX, windY);
            ctx.lineTo(windX + windLength * direction, windY);
            ctx.stroke();
            
            // Arrow head
            ctx.fillStyle = windColor;
            ctx.beginPath();
            ctx.moveTo(windX + windLength * direction, windY);
            ctx.lineTo(windX + windLength * direction - 10 * direction, windY - 5);
            ctx.lineTo(windX + windLength * direction - 10 * direction, windY + 5);
            ctx.closePath();
            ctx.fill();
        } else {
            // No wind indicator
            ctx.fillStyle = GREEN;
            ctx.fillText('None', windX + 10, windY);
        }
    }
}