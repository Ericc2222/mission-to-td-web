class Planet {
    constructor(name, gravity, hasAtmosphere) {
        this.name = name;
        this.gravity = gravity;
        this.hasAtmosphere = hasAtmosphere;
        this.surfaceColor = null;
        this.atmosphereColor = null;
        this.surfaceHeight = 150; // Make ground more visible
        this.description = "";
        this.windForce = 0; // Horizontal force
        this.landingPadX = Math.floor(Math.random() * (WINDOW_WIDTH - 400) + 200); // Random pad position
        this.landingPadWidth = 100;
        this.setupPlanetProperties();
    }

    setupPlanetProperties() {
        switch (this.name) {
            case "Moon":
                this.gravity = 1.62; // m/s²
                this.surfaceColor = '#C8C8C8'; // Lighter gray
                this.atmosphereColor = null;
                this.windForce = 0;
                this.description = "Low gravity (1.6 m/s²)\nNo atmosphere\nPerfect for precise landing!";
                break;
            case "Mars":
                this.gravity = 3.72; // m/s²
                this.surfaceColor = '#C2622D'; // Reddish
                this.atmosphereColor = 'rgba(255, 150, 100, 0.2)';
                this.windForce = (Math.random() * 0.2) - 0.1; // Light wind
                this.description = "Medium gravity (3.7 m/s²)\nThin atmosphere\nWatch for dust storms!";
                break;
            case "Earth":
                this.gravity = 9.81; // m/s²
                this.surfaceColor = '#6496FF'; // Bluish
                this.atmosphereColor = 'rgba(150, 200, 255, 0.2)';
                this.windForce = (Math.random() * 0.4) - 0.2; // Moderate wind
                this.description = "Strong gravity (9.8 m/s²)\nThick atmosphere\nStrong winds!";
                break;
            case "Europa":
                this.gravity = 1.315; // m/s²
                this.surfaceColor = '#DCDCFF'; // Icy white-blue
                this.atmosphereColor = null;
                this.windForce = 0;
                this.description = "Very low gravity (1.3 m/s²)\nNo atmosphere\nIcy surface!";
                break;
            case "Mystery Planet X":
                this.gravity = Math.random() * 11 + 1;
                this.surfaceColor = `rgb(${Math.floor(Math.random() * 206) + 50}, ${Math.floor(Math.random() * 206) + 50}, ${Math.floor(Math.random() * 206) + 50})`;
                this.hasAtmosphere = Math.random() > 0.5;
                this.windForce = this.hasAtmosphere ? (Math.random() * 0.6) - 0.3 : 0;
                if (this.hasAtmosphere) {
                    this.atmosphereColor = `rgba(${Math.floor(Math.random() * 206) + 50}, ${Math.floor(Math.random() * 206) + 50}, ${Math.floor(Math.random() * 206) + 50}, 0.2)`;
                }
                this.description = `Mystery gravity (${this.gravity.toFixed(1)} m/s²)\n${this.hasAtmosphere ? 'Has atmosphere' : 'No atmosphere'}\nUnpredictable!`;
                break;
        }
    }

    draw(ctx) {
        // Draw atmosphere if present
        if (this.atmosphereColor) {
            ctx.fillStyle = this.atmosphereColor;
            ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        }
        
        // Draw surface
        const groundY = WINDOW_HEIGHT - this.surfaceHeight;
        ctx.fillStyle = this.surfaceColor;
        ctx.fillRect(0, groundY, WINDOW_WIDTH, this.surfaceHeight);
        
        // Draw landing pad
        const padY = groundY;
        const padColor = Math.abs(this.windForce) < 0.1 ? GREEN : 
                        (Math.abs(this.windForce) < 0.2 ? YELLOW : ORANGE);
        ctx.fillStyle = padColor;
        ctx.fillRect(this.landingPadX - this.landingPadWidth/2, padY, this.landingPadWidth, 10);
        
        // Draw landing pad lights
        ctx.fillStyle = WHITE;
        for (let x = this.landingPadX - this.landingPadWidth/2; 
                x < this.landingPadX + this.landingPadWidth/2; x += 20) {
            ctx.beginPath();
            ctx.arc(x, padY + 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw surface details (craters or rocks)
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * WINDOW_WIDTH);
            if (Math.abs(x - this.landingPadX) > this.landingPadWidth) { // Don't put rocks on landing pad
                // Darken the surface color for rocks
                const color = this.getDarkerColor(this.surfaceColor, 30);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, groundY + Math.floor(Math.random() * 31) + 10, 
                       Math.floor(Math.random() * 11) + 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Helper method to darken a color
    getDarkerColor(color, amount) {
        // Handle CSS color names or rgba
        if (color.startsWith('rgb')) {
            // Extract RGB values
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            if (match) {
                const r = Math.max(0, parseInt(match[1]) - amount);
                const g = Math.max(0, parseInt(match[2]) - amount);
                const b = Math.max(0, parseInt(match[3]) - amount);
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        
        // Handle hex colors
        if (color.startsWith('#')) {
            let r = parseInt(color.substr(1, 2), 16);
            let g = parseInt(color.substr(3, 2), 16);
            let b = parseInt(color.substr(5, 2), 16);
            
            r = Math.max(0, r - amount);
            g = Math.max(0, g - amount);
            b = Math.max(0, b - amount);
            
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        // If can't parse, return the original color
        return color;
    }
}