// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    
    // Create and start the game
    const game = new Game(canvas);
    game.start();
    
    // Create placeholder sounds if needed
    createPlaceholderSounds();
});

// Function to create placeholder sounds if real ones aren't available
function createPlaceholderSounds() {
    // Check if we already have sounds
    const thrustSound = document.getElementById('thrust-sound');
    const crashSound = document.getElementById('crash-sound');
    const victorySound = document.getElementById('victory-sound');
    
    // If any sound is not loaded, create placeholder data
    if (!thrustSound.src || thrustSound.src === window.location.href) {
        console.log("Creating placeholder thrust sound");
        createOscillatorSound(thrustSound, 'sawtooth', 80, 0.3);
    }
    
    if (!crashSound.src || crashSound.src === window.location.href) {
        console.log("Creating placeholder crash sound");
        createOscillatorSound(crashSound, 'triangle', 150, 1.0);
    }
    
    if (!victorySound.src || victorySound.src === window.location.href) {
        console.log("Creating placeholder victory sound");
        createOscillatorSound(victorySound, 'sine', 440, 0.5);
    }
}

// Function to create a simple audio oscillator sound as placeholder
function createOscillatorSound(audioElement, type, frequency, duration) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Create oscillator
        const oscillator = audioCtx.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        // Create gain node for volume control
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Start and stop
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
        
        // Convert to WAV and set as source
        const offlineCtx = new OfflineAudioContext(1, 44100 * duration, 44100);
        const offlineOsc = offlineCtx.createOscillator();
        const offlineGain = offlineCtx.createGain();
        
        offlineOsc.type = type;
        offlineOsc.frequency.setValueAtTime(frequency, 0);
        offlineGain.gain.setValueAtTime(0.3, 0);
        offlineGain.gain.exponentialRampToValueAtTime(0.01, duration);
        
        offlineOsc.connect(offlineGain);
        offlineGain.connect(offlineCtx.destination);
        
        offlineOsc.start();
        offlineOsc.stop(duration);
        
        offlineCtx.startRendering().then(function(renderedBuffer) {
            const wavBlob = bufferToWav(renderedBuffer);
            const audioURL = URL.createObjectURL(wavBlob);
            audioElement.src = audioURL;
        });
    } catch (e) {
        console.error("Audio context error:", e);
    }
}

// Helper function to convert audio buffer to WAV format
function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    let offset = 0;
    let pos = 0;
    
    // Write the "RIFF" chunk descriptor
    writeString(view, offset, 'RIFF'); offset += 4;
    view.setUint32(offset, 36 + buffer.length * numOfChan * 2, true); offset += 4;
    writeString(view, offset, 'WAVE'); offset += 4;
    
    // Write the "fmt " sub-chunk
    writeString(view, offset, 'fmt '); offset += 4;
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChan, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * 2 * numOfChan, true); offset += 4;
    view.setUint16(offset, numOfChan * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    
    // Write the "data" sub-chunk
    writeString(view, offset, 'data'); offset += 4;
    view.setUint32(offset, buffer.length * numOfChan * 2, true); offset += 4;
    
    // Write the actual samples
    for (let i = 0; i < buffer.length; i++) {
        for (let channel = 0; channel < numOfChan; channel++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return new Blob([view], { type: 'audio/wav' });
}

// Helper to write a string to a DataView
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}