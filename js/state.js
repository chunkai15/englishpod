/**
 * State Management Module
 * Handles localStorage persistence for user's lesson progress
 */

class StateManager {
  constructor() {
    this.storageKey = "englishPod_state";
    this.state = this.loadState();
  }

  /**
   * Load state from localStorage or initialize empty state
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { currentLessonId: null, lessons: {} };
    } catch (e) {
      console.warn("Failed to load state from localStorage:", e);
      return { currentLessonId: null, lessons: {} };
    }
  }

  /**
   * Save entire state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save state to localStorage:", e);
    }
  }

  /**
   * Set current lesson ID
   */
  setCurrentLessonId(lessonId) {
    this.state.currentLessonId = lessonId;
    this.saveState();
  }

  /**
   * Get current lesson ID
   */
  getCurrentLessonId() {
    return this.state.currentLessonId;
  }

  /**
   * Save lesson progress (like timestamp, completion, etc.)
   */
  saveLessonProgress(lessonId, progress) {
    if (!this.state.lessons[lessonId]) {
      this.state.lessons[lessonId] = {};
    }
    this.state.lessons[lessonId] = { ...this.state.lessons[lessonId], ...progress };
    this.saveState();
  }

  /**
   * Get lesson progress
   */
  getLessonProgress(lessonId) {
    return this.state.lessons[lessonId] || {};
  }

  /**
   * Mark lesson as completed
   */
  markLessonCompleted(lessonId, completed = true) {
    this.saveLessonProgress(lessonId, { completed });
  }

  /**
   * Check if lesson is completed
   */
  isLessonCompleted(lessonId) {
    return this.getLessonProgress(lessonId).completed || false;
  }

  /**
   * Save audio timestamp for resume
   */
  saveAudioTime(lessonId, currentTime) {
    this.saveLessonProgress(lessonId, { audioTime: currentTime });
  }

  /**
   * Get saved audio timestamp
   */
  getAudioTime(lessonId) {
    return this.getLessonProgress(lessonId).audioTime || 0;
  }
}

// Create singleton instance
const stateManager = new StateManager();



