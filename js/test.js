// Simple test script to verify basic JavaScript functionality
console.log('Test script loaded successfully');

// Add a visible message to the page
document.addEventListener('DOMContentLoaded', function() {
    const testDiv = document.createElement('div');
    testDiv.style.position = 'fixed';
    testDiv.style.top = '50%';
    testDiv.style.left = '50%';
    testDiv.style.transform = 'translate(-50%, -50%)';
    testDiv.style.padding = '20px';
    testDiv.style.background = 'rgba(0, 0, 0, 0.8)';
    testDiv.style.color = 'white';
    testDiv.style.zIndex = 9999;
    testDiv.style.fontSize = '18px';
    testDiv.style.borderRadius = '10px';
    testDiv.innerHTML = '<h2>JavaScript Test</h2><p>If you can see this message, basic JavaScript is working.</p>';
    document.body.appendChild(testDiv);
    
    // Try to access canvas
    try {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'green';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                testDiv.innerHTML += '<p style="color: #4CAF50;">✓ Canvas is working!</p>';
            } else {
                testDiv.innerHTML += '<p style="color: #F44336;">✗ Could not get canvas context</p>';
            }
        } else {
            testDiv.innerHTML += '<p style="color: #F44336;">✗ Could not find canvas element</p>';
        }
    } catch (e) {
        testDiv.innerHTML += '<p style="color: #F44336;">✗ Error accessing canvas: ' + e.message + '</p>';
    }
});