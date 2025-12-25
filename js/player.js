/**
 * Audio Player Module
 * Handles audio playback, progress tracking, and time display
 */

class AudioPlayer {
  constructor() {
    this.audio = document.getElementById("audioPlayer");
    this.playBtn = document.getElementById("playBtn");
    this.pauseBtn = document.getElementById("pauseBtn");
    this.loopBtn = document.getElementById("loopBtn");
    this.speedSelect = document.getElementById("playbackRate");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.progressSlider = document.getElementById("progressSlider");
    this.progressFill = document.getElementById("progressFill");
    this.currentTimeEl = document.getElementById("currentTime");
    this.durationEl = document.getElementById("duration");
    this.errorMessage = document.getElementById("errorMessage");

    // Default volume at 40% for a comfortable start level.
    this.audio.volume = 0.4;
    if (this.volumeSlider) {
      this.volumeSlider.value = "40";
    }

    this.currentLessonId = null;
    this.autoSaveInterval = null;

    this.setupEventListeners();
  }

  /**
   * Set up all event listeners for audio element and controls
   */
  setupEventListeners() {
    this.playBtn.addEventListener("click", () => this.play());
    this.pauseBtn.addEventListener("click", () => this.pause());
    if (this.loopBtn) {
      this.loopBtn.addEventListener("click", () => this.toggleLoop());
    }
    if (this.speedSelect) {
      this.speedSelect.addEventListener("change", (e) =>
        this.changeSpeed(e)
      );
    }
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", (e) =>
        this.changeVolume(e)
      );
    }
    this.progressSlider.addEventListener("input", (e) => this.seek(e));

    // Update progress as audio plays
    this.audio.addEventListener("timeupdate", () => {
      this.updateProgress();
      // Update subtitle sync if available
      if (typeof subtitleSync !== 'undefined') {
        subtitleSync.update(this.audio.currentTime);
      }
    });

    // Update duration when metadata loads
    this.audio.addEventListener("loadedmetadata", () => this.updateDuration());

    // Handle audio errors
    this.audio.addEventListener("error", () => this.handleAudioError());
  }

  /**
   * Load audio from URL and optionally resume from saved time
   */
  loadAudio(url, lessonId = null, resumeTime = 0) {
    this.clearError();
    this.currentLessonId = lessonId;
    this.audio.src = url;
    this.audio.load();
    
    // Apply current speed & loop to new source
    if (this.speedSelect) {
      const rate = parseFloat(this.speedSelect.value) || 1;
      this.audio.playbackRate = rate;
    }

    // Resume from saved time if provided
    if (resumeTime > 0) {
      this.audio.addEventListener('loadedmetadata', () => {
        if (resumeTime < this.audio.duration) {
          this.audio.currentTime = resumeTime;
        }
      }, { once: true });
    }

    // Start auto-save interval for progress
    this.startAutoSave();
  }

  /**
   * Play audio
   */
  play() {
    this.audio.play().catch((error) => {
      this.showError(`Failed to play audio: ${error.message}`);
    });
  }

  /**
   * Pause audio
   */
  pause() {
    this.audio.pause();
  }

  /**
   * Toggle loop on/off
   */
  toggleLoop() {
    this.audio.loop = !this.audio.loop;
    if (this.loopBtn) {
      this.loopBtn.classList.toggle("is-active", this.audio.loop);
    }
  }

  /**
   * Change playback speed from select
   */
  changeSpeed(event) {
    const value = parseFloat(event.target.value) || 1;
    this.audio.playbackRate = value;
  }

  /**
   * Change volume from slider (0–100 → 0–1)
   */
  changeVolume(event) {
    const value = Number(event.target.value);
    const clamped = Math.min(100, Math.max(0, value));
    this.audio.volume = clamped / 100;
  }

  /**
   * Seek to specific time (handles slider input)
   */
  seek(event) {
    const percent = event.target.value;
    const time = (percent / 100) * this.audio.duration;
    this.audio.currentTime = time;
  }

  /**
   * Update progress bar and current time display
   */
  updateProgress() {
    if (this.audio.duration) {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressFill.style.width = percent + "%";
      this.progressSlider.value = percent;
      this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
  }

  /**
   * Update duration display when metadata loads
   */
  updateDuration() {
    this.durationEl.textContent = this.formatTime(this.audio.duration);
    this.progressSlider.max = 100;
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Show error message
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.style.display = "block";
  }

  /**
   * Clear error message
   */
  clearError() {
    this.errorMessage.style.display = "none";
    this.errorMessage.textContent = "";
  }

  /**
   * Handle audio element errors
   */
  handleAudioError() {
    const errorMessages = {
      4: "Audio format not supported",
      3: "Audio loading was aborted",
      2: "Network error while loading audio",
      1: "Audio loading was aborted",
      0: "No error",
    };
    this.showError(`Audio error: ${errorMessages[this.audio.error?.code] || "Unknown error"}`);
  }

  /**
   * Start auto-save interval to persist audio progress
   */
  startAutoSave() {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      if (this.currentLessonId && this.audio.currentTime > 0 && !this.audio.paused) {
        if (typeof stateManager !== 'undefined') {
          stateManager.saveAudioTime(this.currentLessonId, this.audio.currentTime);
        }
      }
    }, 3000); // Save every 3 seconds
  }

  /**
   * Stop auto-save interval
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Reset player state
   */
  reset() {
    this.stopAutoSave();
    this.audio.src = "";
    this.audio.currentTime = 0;
    this.progressFill.style.width = "0%";
    this.progressSlider.value = 0;
    this.currentTimeEl.textContent = "0:00";
    this.durationEl.textContent = "0:00";
    this.clearError();
    this.audio.loop = false;
    if (this.loopBtn) {
      this.loopBtn.classList.remove("is-active");
    }
    if (this.speedSelect) {
      this.speedSelect.value = "1";
      this.audio.playbackRate = 1;
    }
    this.currentLessonId = null;
    // Keep user's volume preference; do not reset volume here.
  }
}

// Create singleton instance
const audioPlayer = new AudioPlayer();



