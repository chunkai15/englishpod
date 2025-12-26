/**
 * Main Application Module
 * Handles lesson loading, filtering, and UI interactions
 */

class EnglishPodApp {
  constructor() {
    this.lessons = [];
    this.filteredLessons = [];
    this.currentLesson = null;

    // DOM elements
    this.lessonListEl = document.getElementById("lessonList");
    this.lessonTitleEl = document.getElementById("lessonTitle");
    this.lessonMetaEl = document.getElementById("lessonMeta");
    this.scriptContentEl = document.getElementById("scriptContent");
    this.levelFilterEl = document.getElementById("levelFilter");
    this.sourceFilterEl = document.getElementById("sourceFilter");
    this.clearFiltersBtn = document.getElementById("clearFilters");
    this.toggleFiltersBtn = document.getElementById("toggleFilters");
    this.filtersContent = document.getElementById("filtersContent");
    this.lessonCountEl = document.getElementById("lessonCount");
    this.totalLessonsEl = document.getElementById("totalLessons");
    this.toggleTranscriptBtn = document.getElementById("toggleTranscript");

    // Use global singletons from state.js and player.js
    this.stateManager = typeof stateManager !== "undefined" ? stateManager : null;
    this.audioPlayer = typeof audioPlayer !== "undefined" ? audioPlayer : null;
    this.subtitleSync = typeof subtitleSync !== "undefined" ? subtitleSync : null;

    // Track transcript line elements for highlighting
    this.transcriptLineElements = [];

    this.init();
  }

  /**
   * Initialize app: load lessons and set up event listeners
   */
  async init() {
    await this.loadLessons();
    this.setupEventListeners();
    this.setupResponsiveFeatures();
    this.populateFilters();
    this.renderLessons();
    this.updateStats();

    // Restore previously selected lesson if exists
    const savedLessonId = this.stateManager?.getCurrentLessonId();
    if (savedLessonId && this.lessons.find((l) => l.id === savedLessonId)) {
      this.selectLesson(savedLessonId);
    } else if (this.lessons.length) {
      this.selectLesson(this.lessons[0].id);
    }
  }

  /**
   * Setup responsive features for mobile devices
   */
  setupResponsiveFeatures() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll('button, .btn-control, .lesson-item');
    buttons.forEach(btn => {
      btn.style.touchAction = 'manipulation';
    });

    // Auto-scroll to content on mobile when lesson is selected
    if (window.innerWidth <= 768) {
      this.enableMobileAutoScroll = true;
    }

    // Setup mobile menu toggle
    this.setupMobileMenu();

    // Handle orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustLayoutForOrientation();
      }, 100);
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  /**
   * Setup mobile menu toggle functionality
   */
  setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!menuToggle || !sidebar || !overlay) return;

    // Toggle menu
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMobileMenu();
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
      this.closeMobileMenu();
    });

    // Close menu when selecting a lesson on mobile
    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('.lesson-item') && window.innerWidth <= 768) {
        setTimeout(() => {
          this.closeMobileMenu();
        }, 300);
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !overlay) return;

    const isActive = sidebar.classList.contains('active');

    if (isActive) {
      this.closeMobileMenu();
    } else {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      menuToggle?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar || !overlay) return;

    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    menuToggle?.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Adjust layout based on orientation
   */
  adjustLayoutForOrientation() {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
      // Landscape mode on mobile
      if (sidebar) sidebar.style.maxHeight = '150px';
    } else {
      // Portrait mode
      if (sidebar) sidebar.style.maxHeight = '';
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    this.enableMobileAutoScroll = isMobile;
    
    // Close mobile menu if resizing to desktop
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }

  /**
   * Load lessons from lessons.json
   */
  async loadLessons() {
    try {
      const response = await fetch("lessons.json");
      if (!response.ok) throw new Error("Failed to fetch lessons");
      this.lessons = await response.json();
      this.filteredLessons = [...this.lessons];
    } catch (error) {
      console.error("Error loading lessons:", error);
      this.lessonListEl.innerHTML =
        '<p class="error">Failed to load lessons. Please refresh the page.</p>';
    }
  }

  /**
   * Set up filter and other event listeners
   */
  setupEventListeners() {
    this.levelFilterEl.addEventListener("change", () => this.filterLessons());
    this.sourceFilterEl.addEventListener("change", () => this.filterLessons());
    this.clearFiltersBtn.addEventListener("click", () => this.clearAllFilters());
    if (this.toggleFiltersBtn) {
      this.toggleFiltersBtn.addEventListener("click", () => this.toggleFilters());
    }
    if (this.toggleTranscriptBtn) {
      this.toggleTranscriptBtn.addEventListener("click", () =>
        this.toggleTranscript()
      );
    }
  }

  /**
   * Toggle filters section visibility
   */
  toggleFilters() {
    if (!this.toggleFiltersBtn || !this.filtersContent) return;
    
    const isActive = this.filtersContent.classList.toggle("active");
    this.toggleFiltersBtn.classList.toggle("active", isActive);
  }

  /**
   * Clear all active filters
   */
  clearAllFilters() {
    this.levelFilterEl.value = "";
    this.sourceFilterEl.value = "";
    this.filterLessons();
  }

  /**
   * Show / hide transcript area for focused listening.
   */
  toggleTranscript() {
    const section = document.querySelector(".script-section");
    if (!section || !this.toggleTranscriptBtn) return;

    const isHidden = section.classList.toggle("is-collapsed");
    this.scriptContentEl.style.display = isHidden ? "none" : "flex";
    this.toggleTranscriptBtn.textContent = isHidden ? "Show" : "Hide";
  }

  /**
   * Get source for a lesson
   */
  getLessonSource(lesson) {
    if (lesson.source) {
      return lesson.source;
    }
    // If has code field, it's EnglishPod
    if (lesson.code) {
      return "EnglishPod";
    }
    // If id starts with LEP_, it's LEP
    if (typeof lesson.id === "string" && lesson.id.startsWith("LEP_")) {
      return "Luke's English Podcast";
    }
    return "EnglishPod"; // Default fallback
  }

  /**
   * Populate filter dropdowns from lesson data
   */
  populateFilters() {
    // Define level order for proper sorting
    const levelOrder = [
      "Elementary",
      "Pre-Intermediate",
      "Intermediate",
      "Upper-Intermediate",
      "Advanced",
      "Business English",
      "Podcast",
      "Unknown"
    ];

    // Get unique levels and sort by predefined order
    const levels = [...new Set(this.lessons.map((l) => l.level))];
    const sortedLevels = levels.sort((a, b) => {
      const indexA = levelOrder.indexOf(a);
      const indexB = levelOrder.indexOf(b);
      // If both in order, sort by index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one in order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither in order, alphabetical
      return a.localeCompare(b);
    });

    sortedLevels.forEach((level) => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level;
      this.levelFilterEl.appendChild(option);
    });

    // Get unique sources
    const sources = [...new Set(this.lessons.map((l) => this.getLessonSource(l)))].sort();
    sources.forEach((source) => {
      const option = document.createElement("option");
      option.value = source;
      option.textContent = source;
      this.sourceFilterEl.appendChild(option);
    });
  }

  /**
   * Filter lessons based on selected filters
   */
  filterLessons() {
    const level = this.levelFilterEl.value;
    const source = this.sourceFilterEl.value;

    // Auto-expand filters if any filter is active
    if ((level || source) && this.filtersContent && !this.filtersContent.classList.contains("active")) {
      this.filtersContent.classList.add("active");
      if (this.toggleFiltersBtn) {
        this.toggleFiltersBtn.classList.add("active");
      }
    }

    this.filteredLessons = this.lessons.filter((lesson) => {
      const lessonSource = this.getLessonSource(lesson);
      return (!level || lesson.level === level) && (!source || lessonSource === source);
    });

    this.renderLessons();
  }

  /**
   * Update stats display
   */
  updateStats() {
    if (this.totalLessonsEl) {
      this.totalLessonsEl.textContent = `${this.lessons.length} lessons`;
    }
    if (this.lessonCountEl) {
      this.lessonCountEl.textContent = this.filteredLessons.length;
    }
  }

  /**
   * Render lesson list with grouping by level
   */
  renderLessons() {
    this.lessonListEl.innerHTML = "";

    if (this.filteredLessons.length === 0) {
      this.lessonListEl.innerHTML = '<p class="loading">No lessons found</p>';
      this.updateStats();
      return;
    }

    // Define level order for proper sorting (same as in populateFilters)
    const levelOrder = [
      "Elementary",
      "Pre-Intermediate",
      "Intermediate",
      "Upper-Intermediate",
      "Advanced",
      "Business English",
      "Podcast",
      "Unknown"
    ];

    // Group lessons by level
    const grouped = {};
    this.filteredLessons.forEach((lesson) => {
      const level = lesson.level || "Unknown";
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(lesson);
    });

    // Sort lessons within each group by id (for consistent ordering)
    Object.keys(grouped).forEach((level) => {
      grouped[level].sort((a, b) => {
        // If both have numeric IDs, sort numerically
        if (typeof a.id === 'number' && typeof b.id === 'number') {
          return a.id - b.id;
        }
        // If both have string IDs starting with LEP_, sort by number
        if (typeof a.id === 'string' && a.id.startsWith('LEP_') && 
            typeof b.id === 'string' && b.id.startsWith('LEP_')) {
          const numA = parseInt(a.id.replace('LEP_', '')) || 0;
          const numB = parseInt(b.id.replace('LEP_', '')) || 0;
          return numA - numB;
        }
        // Otherwise, sort by id as string
        return String(a.id).localeCompare(String(b.id));
      });
    });

    // Sort groups by levelOrder (same logic as populateFilters)
    const sortedLevels = Object.keys(grouped).sort((a, b) => {
      const indexA = levelOrder.indexOf(a);
      const indexB = levelOrder.indexOf(b);
      // If both in order, sort by index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one in order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither in order, alphabetical
      return a.localeCompare(b);
    });

    // Render each group in sorted order
    sortedLevels.forEach((level) => {
      const groupHeader = document.createElement("div");
      groupHeader.className = "lesson-group-header";
      groupHeader.textContent = level;
      this.lessonListEl.appendChild(groupHeader);

      grouped[level].forEach((lesson) => {
        const lessonEl = document.createElement("div");
        const isCompleted = this.stateManager?.isLessonCompleted(lesson.id);
        lessonEl.className = `lesson-item ${
          this.currentLesson?.id === lesson.id ? "active" : ""
        } ${isCompleted ? "completed" : ""}`;
        
        const lessonSource = this.getLessonSource(lesson);
        lessonEl.innerHTML = `
          <input 
            type="checkbox" 
            class="lesson-checkbox" 
            ${isCompleted ? "checked" : ""}
            data-lesson-id="${lesson.id}"
            aria-label="Mark as completed"
          />
          <div class="lesson-content">
            <div class="lesson-title">${this.escapeHtml(lesson.title)}</div>
            <div class="lesson-meta">${lesson.level} • ${lessonSource}</div>
          </div>
        `;
        
        // Checkbox handler
        const checkbox = lessonEl.querySelector(".lesson-checkbox");
        checkbox.addEventListener("click", (e) => {
          e.stopPropagation();
          this.toggleLessonCompleted(lesson.id, checkbox.checked);
        });

        // Lesson click handler
        lessonEl.addEventListener("click", () => this.selectLesson(lesson.id));
        this.lessonListEl.appendChild(lessonEl);
      });
    });

    this.updateStats();
  }

  /**
   * Toggle lesson completed status
   */
  toggleLessonCompleted(lessonId, completed) {
    this.stateManager?.markLessonCompleted(lessonId, completed);
    this.renderLessons();
  }

  /**
   * Select a lesson and load its content
   */
  async selectLesson(lessonId) {
    const lesson = this.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    this.currentLesson = lesson;
    this.stateManager?.setCurrentLessonId(lessonId);

    // Update UI
    this.lessonTitleEl.textContent = lesson.title;
    const lessonSource = this.getLessonSource(lesson);
    this.lessonMetaEl.textContent = `${lesson.level} • ${lessonSource}`;
    this.renderLessons(); // Re-render to highlight active lesson

    // Auto-scroll to content on mobile
    if (this.enableMobileAutoScroll && window.innerWidth <= 768) {
      setTimeout(() => {
        const playerSection = document.querySelector('.player-section');
        if (playerSection) {
          playerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    // Load audio with resume capability
    this.audioPlayer?.reset();
    if (lesson.audio) {
      const savedTime = this.stateManager?.getAudioTime(lessonId) || 0;
      this.audioPlayer?.loadAudio(lesson.audio, lessonId, savedTime);
    }

    // Load subtitle for auto-highlight if available
    if (this.subtitleSync && lesson.code) {
      this.loadSubtitleForLesson(lesson.code);
    }

    // Load transcript from local HTML if available, otherwise fallback to remote.
    this.loadTranscriptForLesson(lesson);
  }

  /**
   * Load subtitle file and setup auto-highlight
   */
  async loadSubtitleForLesson(lessonCode) {
    if (!this.subtitleSync) return;

    const loaded = await this.subtitleSync.loadSubtitle(lessonCode);
    
    if (loaded) {
      console.log(`✅ Subtitle loaded for lesson ${lessonCode}`);
      
      // Setup callback to highlight transcript lines
      this.subtitleSync.onCueChange = (cue, cueIndex) => {
        this.highlightTranscriptByCue(cue, cueIndex);
      };
    } else {
      console.log(`ℹ️ No subtitle available for lesson ${lessonCode}`);
      this.subtitleSync.onCueChange = null;
    }
  }

  /**
   * Highlight transcript line based on subtitle cue
   */
  highlightTranscriptByCue(cue, cueIndex) {
    // Remove previous highlights
    this.transcriptLineElements.forEach((el) => {
      el.classList.remove("highlight", "auto-highlight");
    });

    // Find matching transcript line by text similarity
    let bestMatch = null;
    let bestScore = 0;

    this.transcriptLineElements.forEach((el, index) => {
      const text = el.querySelector(".transcript-text")?.textContent || "";
      const score = this.calculateTextSimilarity(text, cue.text);
      
      if (score > bestScore && score > 0.4) {
        bestScore = score;
        bestMatch = { el, index, score };
      }
    });

    if (bestMatch) {
      bestMatch.el.classList.add("highlight", "auto-highlight");
      // Scroll into view smoothly
      bestMatch.el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  /**
   * Calculate text similarity (simple word overlap)
   */
  calculateTextSimilarity(text1, text2) {
    const words1 = new Set(
      text1.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/)
    );
    const words2 = new Set(
      text2.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/)
    );

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Try to load a prettified transcript from local /transcript HTML,
   * fallback to remote script via iframe if not found.
   */
  async loadTranscriptForLesson(lesson) {
    const code =
      lesson.code ||
      (typeof lesson.id === "number"
        ? String(lesson.id).padStart(4, "0")
        : "");

    const localUrl = code
      ? `transcript/englishpod_${code}.html`
      : null;

    if (!localUrl) {
      this.loadScriptIframe(lesson.script, lesson.title);
      return;
    }

    try {
      const res = await fetch(localUrl);
      if (!res.ok) {
        throw new Error("Local transcript not found");
      }
      const html = await res.text();
      this.renderTranscriptHtml(html, lesson);
    } catch {
      this.loadScriptIframe(lesson.script, lesson.title);
    }
  }

  /**
   * Load script HTML using iframe (remote archive.org fallback).
   */
  loadScriptIframe(scriptUrl, title) {
    if (!scriptUrl) {
      this.scriptContentEl.innerHTML =
        '<p class="error">No transcript available for this lesson.</p>';
      return;
    }

    this.scriptContentEl.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.className = "script-iframe";
    iframe.src = scriptUrl;
    iframe.title = title || "Lesson transcript";
    iframe.loading = "lazy";
    this.scriptContentEl.appendChild(iframe);
  }

  /**
   * Render cleaned transcript UI from local HTML content.
   */
  renderTranscriptHtml(rawHtml, lesson) {
    // Clear previous transcript line references
    this.transcriptLineElements = [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    const tables = doc.querySelectorAll("table");
    const headings = doc.querySelectorAll("h1");

    const dialogueTable = tables[0] || null;
    const keyVocabTable = tables[1] || null;
    const suppVocabTable = tables[2] || null;

    const transcriptEl = document.createElement("article");
    transcriptEl.className = "transcript";

    // Dialogue section
    if (dialogueTable) {
      const dialogueSection = document.createElement("section");
      dialogueSection.className = "transcript-section";

      const h = document.createElement("h4");
      h.className = "transcript-heading";
      h.textContent =
        headings[0]?.textContent?.trim() || "Dialogue";
      dialogueSection.appendChild(h);

      const linesContainer = document.createElement("div");
      linesContainer.className = "transcript-dialogue";

      dialogueTable.querySelectorAll("tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) return;
        const speakerRaw = cells[0].textContent || "";
        const text = cells[1].textContent.trim();
        if (!text) return;

        const speaker = speakerRaw.replace(":", "").trim();

        const lineEl = document.createElement("div");
        lineEl.className = "transcript-line";

        const speakerEl = document.createElement("span");
        speakerEl.className = "transcript-speaker";
        speakerEl.textContent = speaker || "·";

        const textEl = document.createElement("p");
        textEl.className = "transcript-text";
        textEl.textContent = text;

        lineEl.appendChild(speakerEl);
        lineEl.appendChild(textEl);

        // Click to highlight paragraph
            lineEl.addEventListener("click", () => {
              document.querySelectorAll(".transcript-line").forEach((l) => {
                l.classList.remove("highlight", "auto-highlight");
              });
              lineEl.classList.add("highlight");
            });

            // Store reference for auto-highlight
            this.transcriptLineElements.push(lineEl);

            linesContainer.appendChild(lineEl);
      });

      dialogueSection.appendChild(linesContainer);
      transcriptEl.appendChild(dialogueSection);
    }

    // Helper to build vocab sections
    const buildVocabSection = (table, titleText) => {
      if (!table) return null;
      const section = document.createElement("section");
      section.className = "transcript-section";

      const h = document.createElement("h4");
      h.className = "transcript-heading";
      h.textContent = titleText;
      section.appendChild(h);

      const grid = document.createElement("div");
      grid.className = "vocab-grid";

      table.querySelectorAll("tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 3) return;
        const term = cells[0].textContent.trim();
        const part = cells[1].textContent.trim();
        const meaning = cells[2].textContent.trim();
        if (!term || !meaning) return;

        const item = document.createElement("div");
        item.className = "vocab-item";

        const termEl = document.createElement("div");
        termEl.className = "vocab-term";
        termEl.textContent = term;

        const metaEl = document.createElement("div");
        metaEl.className = "vocab-meta";
        metaEl.textContent = part;

        const meaningEl = document.createElement("div");
        meaningEl.className = "vocab-meaning";
        meaningEl.textContent = meaning;

        item.appendChild(termEl);
        if (part) item.appendChild(metaEl);
        item.appendChild(meaningEl);
        grid.appendChild(item);
      });

      section.appendChild(grid);
      return section;
    };

    const keyTitle =
      headings[1]?.textContent?.trim() || "Key Vocabulary";
    const suppTitle =
      headings[2]?.textContent?.trim() || "Supplementary Vocabulary";

    const keySection = buildVocabSection(
      keyVocabTable,
      keyTitle
    );
    const suppSection = buildVocabSection(
      suppVocabTable,
      suppTitle
    );

    if (keySection) transcriptEl.appendChild(keySection);
    if (suppSection) transcriptEl.appendChild(suppSection);

    // Fallback: if nothing was built, show a simple message.
    if (!transcriptEl.children.length) {
      transcriptEl.textContent =
        "Transcript format not recognized for this lesson.";
    }

    this.scriptContentEl.innerHTML = "";
    this.scriptContentEl.appendChild(transcriptEl);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new EnglishPodApp();
});