/**
 * Subtitle Sync Module
 * Parses WebVTT subtitle files and syncs with audio playback
 * to auto-highlight transcript lines
 */

class SubtitleSync {
  constructor() {
    this.cues = [];
    this.currentCueIndex = -1;
    this.onCueChange = null;
  }

  /**
   * Parse WebVTT format subtitle file
   * Format:
   * WEBVTT
   * 
   * 00:00:00.000 --> 00:00:03.000
   * First line of dialogue
   * 
   * 00:00:03.500 --> 00:00:07.000
   * Second line of dialogue
   */
  parseVTT(vttContent) {
    this.cues = [];
    const lines = vttContent.split("\n");
    let i = 0;

    // Skip WEBVTT header and metadata
    while (i < lines.length && !lines[i].includes("-->")) {
      i++;
    }

    // Parse cues
    while (i < lines.length) {
      const line = lines[i].trim();

      // Check if this is a timestamp line
      if (line.includes("-->")) {
        const [startStr, endStr] = line.split("-->").map((s) => s.trim());
        const start = this.parseTimestamp(startStr);
        const end = this.parseTimestamp(endStr);

        // Collect text lines until empty line
        const textLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== "") {
          textLines.push(lines[i].trim());
          i++;
        }

        if (textLines.length > 0) {
          this.cues.push({
            start,
            end,
            text: textLines.join(" "),
          });
        }
      }

      i++;
    }

    console.log(`📝 Parsed ${this.cues.length} subtitle cues`);
    return this.cues;
  }

  /**
   * Parse timestamp string to seconds
   * Format: 00:00:12.340 or 00:12.340
   */
  parseTimestamp(timestamp) {
    const parts = timestamp.split(":");
    let seconds = 0;

    if (parts.length === 3) {
      // HH:MM:SS.mmm
      seconds =
        parseInt(parts[0]) * 3600 +
        parseInt(parts[1]) * 60 +
        parseFloat(parts[2]);
    } else if (parts.length === 2) {
      // MM:SS.mmm
      seconds = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else {
      // SS.mmm
      seconds = parseFloat(parts[0]);
    }

    return seconds;
  }

  /**
   * Load subtitle file for a lesson
   */
  async loadSubtitle(lessonCode) {
    try {
      const url = `subtitles/englishpod_${lessonCode}.vtt`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Subtitle not found: ${url}`);
      }

      const vttContent = await response.text();
      this.parseVTT(vttContent);
      return true;
    } catch (error) {
      console.warn(`⚠️ Could not load subtitle: ${error.message}`);
      this.cues = [];
      return false;
    }
  }

  /**
   * Find the cue index for a given time
   */
  findCueIndexAtTime(currentTime) {
    for (let i = 0; i < this.cues.length; i++) {
      const cue = this.cues[i];
      if (currentTime >= cue.start && currentTime < cue.end) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Update current cue based on audio time
   * Call this from audio timeupdate event
   */
  update(currentTime) {
    const newIndex = this.findCueIndexAtTime(currentTime);

    if (newIndex !== this.currentCueIndex) {
      this.currentCueIndex = newIndex;

      if (this.onCueChange && newIndex >= 0) {
        const cue = this.cues[newIndex];
        this.onCueChange(cue, newIndex);
      }
    }
  }

  /**
   * Get current active cue
   */
  getCurrentCue() {
    if (this.currentCueIndex >= 0 && this.currentCueIndex < this.cues.length) {
      return this.cues[this.currentCueIndex];
    }
    return null;
  }

  /**
   * Reset state
   */
  reset() {
    this.cues = [];
    this.currentCueIndex = -1;
  }

  /**
   * Match transcript lines with subtitle cues
   * This creates a mapping between dialogue lines and subtitle timestamps
   */
  matchTranscriptLines(transcriptLines) {
    const matches = [];

    transcriptLines.forEach((line, lineIndex) => {
      // Try to find matching cue by text similarity
      let bestMatch = null;
      let bestScore = 0;

      this.cues.forEach((cue, cueIndex) => {
        const score = this.textSimilarity(line.text, cue.text);
        if (score > bestScore && score > 0.5) {
          // threshold
          bestScore = score;
          bestMatch = { cueIndex, cue, score };
        }
      });

      matches.push({
        lineIndex,
        line,
        match: bestMatch,
      });
    });

    return matches;
  }

  /**
   * Simple text similarity (Jaccard similarity on words)
   */
  textSimilarity(text1, text2) {
    const words1 = new Set(
      text1
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
    );
    const words2 = new Set(
      text2
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
    );

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

// Create singleton instance
const subtitleSync = new SubtitleSync();



