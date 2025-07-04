class AudioService {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.volume = 0.1; // Default volume (10%)
    this.lastHoverTime = 0;
    this.hoverDebounceMs = 100; // Prevent hover spam
    
    // Background music properties
    this.backgroundMusicEnabled = false;
    this.backgroundMusicVolume = 0.03; // Very quiet (3%)
    this.backgroundNodes = {};
    this.isBackgroundPlaying = false;
    this.backgroundLoopLength = 24; // seconds
    this.nextBackgroundTime = 0;
    this.wasPausedByVisibility = false;
    
    // Handle page visibility changes
    this.setupVisibilityHandling();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create audio context (requires user gesture)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume context if suspended (Chrome's autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.warn('Audio service initialization failed:', error);
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isBackgroundPlaying) {
      this.stopBackgroundMusic();
    } else if (!muted && this.backgroundMusicEnabled && !this.isBackgroundPlaying) {
      this.startBackgroundMusic();
    }
  }

  setBackgroundMusicEnabled(enabled) {
    this.backgroundMusicEnabled = enabled;
    if (enabled && !this.isMuted && this.isInitialized) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  setBackgroundMusicVolume(volume) {
    this.backgroundMusicVolume = Math.max(0, Math.min(0.15, volume));
    // Update existing background nodes if playing
    if (this.backgroundNodes.masterGain) {
      this.backgroundNodes.masterGain.gain.value = this.backgroundMusicVolume;
    }
  }

  createOscillator(frequency, type = 'sine') {
    if (!this.audioContext || this.isMuted) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = this.volume;

    return { oscillator, gainNode };
  }

  // Get current theme for theme-specific sounds
  getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  // Card hover sound - theme-specific
  playCardHover() {
    const now = Date.now();
    if (now - this.lastHoverTime < this.hoverDebounceMs) return;
    this.lastHoverTime = now;

    if (!this.initialize()) return;

    const theme = this.getCurrentTheme();
    
    switch(theme) {
      case 'fantasy':
        this.playDefaultHover();
        break;
      case 'neon':
        this.playDefaultHover();
        break;
      default:
        this.playDefaultHover();
    }
  }

  playDefaultHover() {
    const sound = this.createOscillator(400, 'sine');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.08);
  }

  playNeonHover() {
    const sound = this.createOscillator(800, 'square');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.06);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.06);
  }

  playFantasyHover() {
    // Subtle single-tone whisper
    const whisper = this.createOscillator(392, 'sine'); // G4 - low, gentle tone
    
    if (!whisper) return;

    const currentTime = this.audioContext.currentTime;

    // Single whisper tone - 50% quieter, most subtle
    whisper.gainNode.gain.setValueAtTime(0, currentTime);
    whisper.gainNode.gain.linearRampToValueAtTime(this.volume * 0.075, currentTime + 0.02); // 50% of original 0.15
    whisper.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
    whisper.oscillator.start(currentTime);
    whisper.oscillator.stop(currentTime + 0.2);
  }

  // Card add sound - theme-specific
  playCardAdd() {
    if (!this.initialize()) return;

    const theme = this.getCurrentTheme();
    
    switch(theme) {
      case 'fantasy':
        this.playDefaultAdd();
        break;
      case 'neon':
        this.playDefaultAdd();
        break;
      default:
        this.playDefaultAdd();
    }
  }

  playDefaultAdd() {
    const sound1 = this.createOscillator(523, 'sine'); // C5
    const sound2 = this.createOscillator(659, 'sine'); // E5
    
    if (!sound1 || !sound2) return;

    const currentTime = this.audioContext.currentTime;

    sound1.gainNode.gain.setValueAtTime(0, currentTime);
    sound1.gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, currentTime + 0.02);
    sound1.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
    sound1.oscillator.start(currentTime);
    sound1.oscillator.stop(currentTime + 0.15);

    sound2.gainNode.gain.setValueAtTime(0, currentTime + 0.05);
    sound2.gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.07);
    sound2.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
    sound2.oscillator.start(currentTime + 0.05);
    sound2.oscillator.stop(currentTime + 0.2);
  }

  playNeonAdd() {
    const sound1 = this.createOscillator(880, 'sawtooth');
    const sound2 = this.createOscillator(1108, 'square');
    
    if (!sound1 || !sound2) return;

    const currentTime = this.audioContext.currentTime;

    sound1.gainNode.gain.setValueAtTime(0, currentTime);
    sound1.gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.01);
    sound1.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
    sound1.oscillator.start(currentTime);
    sound1.oscillator.stop(currentTime + 0.12);

    sound2.gainNode.gain.setValueAtTime(0, currentTime + 0.03);
    sound2.gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, currentTime + 0.05);
    sound2.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
    sound2.oscillator.start(currentTime + 0.03);
    sound2.oscillator.stop(currentTime + 0.15);
  }

  playFantasyAdd() {
    // Short, ascending magical chime - positive and chirpy
    const base = this.createOscillator(523, 'sine'); // C5 - clear base
    const harmony = this.createOscillator(659, 'sine'); // E5 - major third
    const sparkle = this.createOscillator(1047, 'triangle'); // C6 - magical shimmer
    
    if (!base || !harmony || !sparkle) return;

    const currentTime = this.audioContext.currentTime;

    // Base note - immediate, bright attack
    base.gainNode.gain.setValueAtTime(0, currentTime);
    base.gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, currentTime + 0.01);
    base.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
    base.oscillator.frequency.exponentialRampToValueAtTime(550, currentTime + 0.25); // Slight upward bend
    base.oscillator.start(currentTime);
    base.oscillator.stop(currentTime + 0.25);

    // Harmony - slight delay for magical layering
    harmony.gainNode.gain.setValueAtTime(0, currentTime + 0.02);
    harmony.gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.03);
    harmony.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
    harmony.oscillator.start(currentTime + 0.02);
    harmony.oscillator.stop(currentTime + 0.2);

    // Sparkle - brief magical shimmer
    sparkle.gainNode.gain.setValueAtTime(0, currentTime + 0.05);
    sparkle.gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, currentTime + 0.07);
    sparkle.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);
    sparkle.oscillator.start(currentTime + 0.05);
    sparkle.oscillator.stop(currentTime + 0.15);
  }

  // Card remove sound - theme-specific
  playCardRemove() {
    if (!this.initialize()) return;

    const theme = this.getCurrentTheme();
    
    switch(theme) {
      case 'fantasy':
        this.playDefaultRemove();
        break;
      case 'neon':
        this.playDefaultRemove();
        break;
      default:
        this.playDefaultRemove();
    }
  }

  playDefaultRemove() {
    const sound = this.createOscillator(300, 'triangle');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.35, currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.06);

    oscillator.frequency.setValueAtTime(300, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, currentTime + 0.06);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.06);
  }

  playNeonRemove() {
    const sound = this.createOscillator(600, 'sawtooth');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.04);

    oscillator.frequency.setValueAtTime(600, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.04);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.04);
  }

  playFantasyRemove() {
    // Mystical "whoosh" with voice undertone
    const whoosh = this.createOscillator(440, 'triangle');
    const voice = this.createOscillator(165, 'sine'); // Low "ooh" sound
    
    if (!whoosh || !voice) return;

    const currentTime = this.audioContext.currentTime;

    // Whoosh effect
    whoosh.gainNode.gain.setValueAtTime(0, currentTime);
    whoosh.gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, currentTime + 0.02);
    whoosh.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.2);
    whoosh.oscillator.frequency.exponentialRampToValueAtTime(220, currentTime + 0.2);
    whoosh.oscillator.start(currentTime);
    whoosh.oscillator.stop(currentTime + 0.2);

    // Voice undertone
    voice.gainNode.gain.setValueAtTime(0, currentTime);
    voice.gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, currentTime + 0.05);
    voice.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
    voice.oscillator.start(currentTime);
    voice.oscillator.stop(currentTime + 0.25);
  }

  // Button click sound - theme-specific
  playButtonClick() {
    if (!this.initialize()) return;

    const theme = this.getCurrentTheme();
    
    switch(theme) {
      case 'fantasy':
        this.playDefaultClick();
        break;
      case 'neon':
        this.playDefaultClick();
        break;
      default:
        this.playDefaultClick();
    }
  }

  playDefaultClick() {
    const sound = this.createOscillator(800, 'square');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.25, currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.04);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.04);
  }

  playNeonClick() {
    const sound = this.createOscillator(1200, 'square');
    if (!sound) return;

    const { oscillator, gainNode } = sound;
    const currentTime = this.audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, currentTime + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.03);
  }

  playFantasyClick() {
    // Stone "tap" with magical resonance
    const tap = this.createOscillator(400, 'triangle');
    const resonance = this.createOscillator(800, 'sine');
    
    if (!tap || !resonance) return;

    const currentTime = this.audioContext.currentTime;

    // Stone tap
    tap.gainNode.gain.setValueAtTime(0, currentTime);
    tap.gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, currentTime + 0.01);
    tap.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);
    tap.oscillator.start(currentTime);
    tap.oscillator.stop(currentTime + 0.08);

    // Magical resonance
    resonance.gainNode.gain.setValueAtTime(0, currentTime + 0.02);
    resonance.gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, currentTime + 0.04);
    resonance.gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.12);
    resonance.oscillator.start(currentTime + 0.02);
    resonance.oscillator.stop(currentTime + 0.12);
  }

  // Background Music System
  startBackgroundMusic() {
    if (!this.audioContext || this.isMuted || !this.backgroundMusicEnabled || this.isBackgroundPlaying) {
      return;
    }

    this.isBackgroundPlaying = true;
    this.nextBackgroundTime = this.audioContext.currentTime;
    this.scheduleBackgroundLoop();
  }

  stopBackgroundMusic() {
    this.isBackgroundPlaying = false;
    
    // Clean up existing nodes
    Object.values(this.backgroundNodes).forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    this.backgroundNodes = {};
  }

  scheduleBackgroundLoop() {
    if (!this.isBackgroundPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextBackgroundTime);
    
    this.createBackgroundLayer(startTime);
    
    // Schedule next loop
    this.nextBackgroundTime = startTime + this.backgroundLoopLength;
    
    // Schedule the next iteration
    setTimeout(() => {
      if (this.isBackgroundPlaying) {
        this.scheduleBackgroundLoop();
      }
    }, (this.backgroundLoopLength - 1) * 1000); // Schedule 1 second before loop ends
  }

  createBackgroundLayer(startTime) {
    if (!this.audioContext) return;

    // Master gain for background music
    const masterGain = this.audioContext.createGain();
    masterGain.connect(this.audioContext.destination);
    masterGain.gain.value = this.backgroundMusicVolume;
    this.backgroundNodes.masterGain = masterGain;

    // Bass drone layer
    this.createBassDrone(startTime, masterGain);
    
    // Ambient pad layer
    this.createAmbientPad(startTime, masterGain);
    
    // Subtle rhythm layer
    this.createRhythmLayer(startTime, masterGain);
  }

  createBassDrone(startTime, destination) {
    // Low bass drone with slow LFO modulation
    const bassOsc = this.audioContext.createOscillator();
    const bassGain = this.audioContext.createGain();
    const bassFilter = this.audioContext.createBiquadFilter();
    
    // LFO for subtle bass modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    
    // Setup bass oscillator
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 65; // Low C
    
    // Setup filter
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 120;
    bassFilter.Q.value = 1;
    
    // Setup LFO
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow modulation
    lfoGain.gain.value = 3; // Subtle frequency modulation
    
    // Connect bass chain
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(destination);
    
    // Connect LFO
    lfo.connect(lfoGain);
    lfoGain.connect(bassOsc.frequency);
    
    // Set levels
    bassGain.gain.value = 0.3;
    
    // Envelope: fade in and maintain
    bassGain.gain.setValueAtTime(0, startTime);
    bassGain.gain.linearRampToValueAtTime(0.3, startTime + 2);
    bassGain.gain.linearRampToValueAtTime(0.25, startTime + this.backgroundLoopLength - 2);
    bassGain.gain.linearRampToValueAtTime(0, startTime + this.backgroundLoopLength);
    
    // Start oscillators
    bassOsc.start(startTime);
    lfo.start(startTime);
    
    // Stop at end of loop
    bassOsc.stop(startTime + this.backgroundLoopLength);
    lfo.stop(startTime + this.backgroundLoopLength);
    
    // Store references
    this.backgroundNodes[`bass_${startTime}`] = { bassOsc, lfo, bassGain };
  }

  createAmbientPad(startTime, destination) {
    // Soft ambient pad with filter sweep
    const pad1 = this.audioContext.createOscillator();
    const pad2 = this.audioContext.createOscillator();
    const padGain = this.audioContext.createGain();
    const padFilter = this.audioContext.createBiquadFilter();
    
    // Filter LFO
    const filterLfo = this.audioContext.createOscillator();
    const filterLfoGain = this.audioContext.createGain();
    
    // Setup pad oscillators (minor chord)
    pad1.type = 'triangle';
    pad1.frequency.value = 196; // G3
    pad2.type = 'triangle';
    pad2.frequency.value = 233; // Bb3
    
    // Setup filter
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 800;
    padFilter.Q.value = 0.5;
    
    // Setup filter LFO
    filterLfo.type = 'sine';
    filterLfo.frequency.value = 0.05; // Very slow sweep
    filterLfoGain.gain.value = 200; // Gentle filter modulation
    
    // Connect pad chain
    pad1.connect(padGain);
    pad2.connect(padGain);
    padGain.connect(padFilter);
    padFilter.connect(destination);
    
    // Connect filter LFO
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(padFilter.frequency);
    
    // Set levels
    padGain.gain.value = 0.15;
    
    // Envelope: slow fade in/out
    padGain.gain.setValueAtTime(0, startTime);
    padGain.gain.linearRampToValueAtTime(0.15, startTime + 4);
    padGain.gain.linearRampToValueAtTime(0.12, startTime + this.backgroundLoopLength - 4);
    padGain.gain.linearRampToValueAtTime(0, startTime + this.backgroundLoopLength);
    
    // Start oscillators
    pad1.start(startTime + 2); // Delayed start
    pad2.start(startTime + 2);
    filterLfo.start(startTime);
    
    // Stop at end
    pad1.stop(startTime + this.backgroundLoopLength);
    pad2.stop(startTime + this.backgroundLoopLength);
    filterLfo.stop(startTime + this.backgroundLoopLength);
    
    this.backgroundNodes[`pad_${startTime}`] = { pad1, pad2, filterLfo, padGain };
  }

  createRhythmLayer(startTime, destination) {
    // Consistent kick drum and hi-hat pattern
    const rhythmGain = this.audioContext.createGain();
    rhythmGain.connect(destination);
    rhythmGain.gain.value = 0.12;
    
    // 120 BPM = 0.5 seconds per beat
    const beatInterval = 0.5;
    const numBeats = Math.floor(this.backgroundLoopLength / beatInterval);
    
    for (let i = 0; i < numBeats; i++) {
      const beatTime = startTime + (i * beatInterval);
      
      // Kick drum on beats 1 and 3 of every bar (every 2 seconds)
      if (i % 4 === 0 || i % 4 === 2) {
        this.createKickDrum(beatTime, rhythmGain);
      }
      
      // Hi-hat on every beat with emphasis on off-beats
      const hihatVolume = (i % 2 === 1) ? 0.6 : 0.3; // Stronger on off-beats
      this.createRhythmHit(beatTime, rhythmGain, hihatVolume);
    }
  }

  createKickDrum(startTime, destination) {
    // Create a kick drum using low-frequency sine wave
    const kick = this.audioContext.createOscillator();
    const kickGain = this.audioContext.createGain();
    const kickFilter = this.audioContext.createBiquadFilter();
    
    // Setup kick oscillator
    kick.type = 'sine';
    kick.frequency.value = 60; // Low kick frequency
    
    // Setup filter
    kickFilter.type = 'lowpass';
    kickFilter.frequency.value = 150;
    kickFilter.Q.value = 1;
    
    // Connect chain
    kick.connect(kickFilter);
    kickFilter.connect(kickGain);
    kickGain.connect(destination);
    
    // Kick envelope - quick attack, fast decay
    kickGain.gain.setValueAtTime(0.8, startTime);
    kickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
    
    // Frequency envelope for punch
    kick.frequency.setValueAtTime(60, startTime);
    kick.frequency.exponentialRampToValueAtTime(40, startTime + 0.05);
    
    // Play the kick
    kick.start(startTime);
    kick.stop(startTime + 0.1);
  }

  createRhythmHit(startTime, destination, volume = 0.4) {
    // Create a brief filtered noise burst for hi-hat
    const noise = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    
    // Create noise buffer
    const bufferSize = Math.floor(this.audioContext.sampleRate * 0.05);
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = noiseBuffer;
    
    // Setup filter for hi-hat sound
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 8000;
    noiseFilter.Q.value = 1;
    
    // Connect chain
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);
    
    // Quick envelope with variable volume
    noiseGain.gain.setValueAtTime(volume, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);
    
    // Play the hit
    noise.start(startTime);
    noise.stop(startTime + 0.03);
  }

  setupVisibilityHandling() {
    // Pause/resume background music when tab loses/gains focus
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Tab lost focus - pause background music
          if (this.isBackgroundPlaying) {
            this.stopBackgroundMusic();
            this.wasPausedByVisibility = true;
          }
        } else {
          // Tab gained focus - resume if it was playing
          if (this.wasPausedByVisibility && this.backgroundMusicEnabled && !this.isMuted) {
            this.startBackgroundMusic();
            this.wasPausedByVisibility = false;
          }
        }
      });
    }
  }

  // Initialize on first user interaction
  async initializeOnUserGesture() {
    if (!this.isInitialized) {
      await this.initialize();
      // Auto-start background music if enabled
      if (this.backgroundMusicEnabled && !this.isMuted) {
        this.startBackgroundMusic();
      }
    }
  }
}

// Create and export singleton instance
const audioService = new AudioService();
export default audioService;