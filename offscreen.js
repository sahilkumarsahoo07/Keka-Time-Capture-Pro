// offscreen.js - Handles audio playback for the background service worker

// Sound configurations (same as popup.js)
const notificationSounds = {
    bell: { frequency: 800, duration: 0.3, type: 'sine' },
    chime: { frequencies: [523.25, 659.25, 783.99], duration: 0.15, type: 'sine' },
    ding: { frequency: 1000, duration: 0.2, type: 'triangle' },
    success: { frequencies: [523.25, 659.25, 783.99, 1046.50], duration: 0.12, type: 'sine' },
    alert: { frequencies: [880, 880, 880], duration: 0.15, type: 'square' },
    gentle: { frequencies: [440, 554.37], duration: 0.25, type: 'sine' },
    digital: { frequency: 1200, duration: 0.15, type: 'square' },
    marimba: { frequencies: [659.25, 783.99, 987.77], duration: 0.18, type: 'triangle' },
    harp: { frequencies: [523.25, 587.33, 659.25, 783.99, 880], duration: 0.08, type: 'sine' },
    xylophone: { frequencies: [1046.50, 1174.66, 1318.51], duration: 0.12, type: 'triangle' },
    piano: { frequencies: [261.63, 329.63, 392], duration: 0.35, type: 'sine' },
    glass: { frequencies: [2093, 2349.32], duration: 0.2, type: 'sine' },
    coin: { frequencies: [1318.51, 1567.98], duration: 0.1, type: 'triangle' },
    swoosh: { frequency: 600, duration: 0.25, type: 'sawtooth', sweep: true },
    pop: { frequency: 400, duration: 0.08, type: 'sine' },
    beep: { frequencies: [1000, 1000], duration: 0.1, type: 'square' },
    whatsapp: { frequencies: [587.33, 659.25], duration: 0.08, type: 'sine', gap: 0.05 },
    iphone: {
        frequencies: [1174.66, 880, 587.33], // D6, A5, D5 - Authentic iPhone Tri-tone
        duration: 0.3,
        type: 'sine',
        gap: 0.08
    },
    samsung: { frequencies: [659.25, 880, 1046.50, 1318.51], duration: 0.15, type: 'sine', gap: 0.05 },
    messenger: { frequencies: [880, 1046.50], duration: 0.06, type: 'sine' },
    slack: { frequencies: [698.46, 830.61, 698.46], duration: 0.12, type: 'sine', gap: 0.08 },
    discord: { frequencies: [1046.50, 1318.51], duration: 0.1, type: 'sine' },
    teams: {
        frequencies: [523.25, 659.25], // C5, E5 - Microsoft Teams notification
        duration: 0.25,
        type: 'sine',
        gap: 0.05
    },
    tweet: { frequencies: [1568, 1318.51], duration: 0.06, type: 'sine' },

    // Musical Tunes
    happyBirthday: {
        frequencies: [
            // Happy birthday to you (G G A G C B)
            392, 392, 440, 392, 523.25, 493.88,
            // Happy birthday to you (G G A G D C)
            392, 392, 440, 392, 587.33, 523.25,
            // Happy birthday dear [name] (G G G E C B A)
            392, 392, 783.99, 659.25, 523.25, 493.88, 440,
            // Happy birthday to you (F F E C D C)
            698.46, 698.46, 659.25, 523.25, 587.33, 523.25
        ],
        duration: 0.25,
        type: 'sine',
        gap: 0.05
    },
    jingleBells: {
        frequencies: [
            // Jingle bells, jingle bells, jingle all the way (E E E, E E E, E G C D E)
            659.25, 659.25, 659.25, 0,
            659.25, 659.25, 659.25, 0,
            659.25, 783.99, 523.25, 587.33, 659.25, 0, 0,
            // Oh what fun it is to ride (F F F F F E E E E D D E D G)
            698.46, 698.46, 698.46, 698.46,
            698.46, 659.25, 659.25, 659.25, 659.25,
            587.33, 587.33, 659.25, 587.33, 0, 783.99
        ],
        duration: 0.18,
        type: 'sine',
        gap: 0.04
    },
    twinkleStar: {
        frequencies: [
            // Twinkle twinkle little star (C C G G A A G)
            523.25, 523.25, 783.99, 783.99, 880, 880, 783.99, 0,
            // How I wonder what you are (F F E E D D C)
            698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25, 0,
            // Up above the world so high (G G F F E E D)
            783.99, 783.99, 698.46, 698.46, 659.25, 659.25, 587.33, 0,
            // Like a diamond in the sky (G G F F E E D)
            783.99, 783.99, 698.46, 698.46, 659.25, 659.25, 587.33, 0,
            // Twinkle twinkle little star (C C G G A A G)
            523.25, 523.25, 783.99, 783.99, 880, 880, 783.99, 0,
            // How I wonder what you are (F F E E D D C)
            698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25
        ],
        duration: 0.2,
        type: 'sine',
        gap: 0.05
    },
    nokiaTune: {
        frequencies: [
            // Classic Nokia Tune (E D F# G# C# B D E)
            659.25, 587.33, 369.99, 415.30,
            554.37, 493.88, 293.66, 329.63,
            // Repeat
            659.25, 587.33, 369.99, 415.30,
            554.37, 493.88, 293.66, 329.63
        ],
        duration: 0.125,
        type: 'sine',
        gap: 0.04
    },
    superMario: {
        frequencies: [
            // Opening: E E 0 E 0 C E 0 G 0 0 0 G(low)
            659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 0, 392, 0, 0, 0,
            // Main melody: C 0 0 G(low) 0 0 E 0 0 A 0 B 0 Bb A
            523.25, 0, 0, 392, 0, 0, 329.63, 0, 0, 440, 0, 493.88, 0, 466.16, 440, 0,
            // Continue: G E G A 0 F G 0 E 0 C D B
            392, 659.25, 0, 783.99, 880, 0, 698.46, 783.99, 0, 659.25, 0, 523.25, 587.33, 493.88, 0, 0,
            // Repeat opening phrase
            523.25, 0, 0, 392, 0, 0, 329.63, 0, 0, 440, 0, 493.88, 0, 466.16, 440, 0,
            // Final phrase: G E G A 0 F G 0 E 0 C D B
            392, 659.25, 0, 783.99, 880, 0, 698.46, 783.99, 0, 659.25, 0, 523.25, 587.33, 493.88, 0, 0,
            // Ending
            0, 783.99, 740, 698.46, 622.25, 0, 659.25, 0, 415.30, 440, 523.25, 0, 440, 523.25, 587.33, 0,
            783.99, 740, 698.46, 622.25, 0, 659.25, 0, 1046.50, 0, 1046.50, 1046.50, 0, 0, 0
        ],
        duration: 0.11,
        type: 'square',
        gap: 0.025
    },
    zelda: {
        frequencies: [
            783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99,
            880, 932.33, 1046.50, 1174.66, 1318.51,
            1318.51, 1174.66, 1046.50, 932.33, 880, 783.99
        ],
        duration: 0.14,
        type: 'triangle',
        gap: 0.05
    },
    tetris: {
        frequencies: [
            659.25, 493.88, 523.25, 587.33, 523.25, 493.88,
            440, 440, 523.25, 659.25, 587.33, 523.25,
            493.88, 0, 493.88, 523.25, 587.33, 0, 659.25,
            523.25, 440, 0, 440, 493.88, 523.25, 554.37, 587.33,
            659.25, 523.25, 440, 440, 0, 493.88, 523.25
        ],
        duration: 0.11,
        type: 'square',
        gap: 0.03
    },
    finalFantasy: {
        frequencies: [
            523.25, 523.25, 523.25, 523.25,
            659.25, 587.33, 659.25, 783.99,
            880, 783.99, 880, 1046.50,
            1174.66, 1046.50, 880, 783.99,
            659.25, 783.99, 880, 1046.50, 1174.66,
            1318.51, 1318.51, 1318.51, 1318.51
        ],
        duration: 0.13,
        type: 'sine',
        gap: 0.04
    },

    silent: null
};

// Play notification sound
function playNotificationSound(soundType = 'bell') {
    try {
        const soundConfig = notificationSounds[soundType] || notificationSounds.bell;

        // Silent option - do nothing
        if (soundConfig === null) {
            return;
        }

        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (soundConfig.frequencies) {
            // Play multiple notes
            const gap = soundConfig.gap || 0;
            soundConfig.frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = soundConfig.type;

                const startTime = audioContext.currentTime + (index * (soundConfig.duration + gap));
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + soundConfig.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + soundConfig.duration);
            });
        } else {
            // Play single note
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = soundConfig.frequency;
            oscillator.type = soundConfig.type;

            // Special handling for swoosh - frequency sweep
            if (soundConfig.sweep) {
                oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(soundConfig.frequency * 0.5, audioContext.currentTime + soundConfig.duration);
            }

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + soundConfig.duration);
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PLAY_NOTIFICATION_SOUND') {
        playNotificationSound(message.soundType);
        sendResponse({ success: true });
    }
    return true;
});
