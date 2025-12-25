/**
 * Generate subtitle files using Whisper AI
 * 
 * Prerequisites:
 * 1. Install Python 3.8+
 * 2. Install Whisper: pip install -U openai-whisper
 * 3. Install ffmpeg: https://ffmpeg.org/download.html
 * 
 * Usage:
 *   node generate-subtitles.js
 * 
 * This script will:
 * - Read lessons.json
 * - Download audio files (or use URLs directly)
 * - Run Whisper to generate .vtt subtitle files
 * - Save to subtitles/ folder
 */

import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const LESSONS_FILE = "lessons.json";
const SUBTITLES_DIR = "subtitles";
const WHISPER_MODEL = "base"; // tiny, base, small, medium, large

// Ensure subtitles directory exists
if (!fs.existsSync(SUBTITLES_DIR)) {
  fs.mkdirSync(SUBTITLES_DIR, { recursive: true });
}

/**
 * Generate subtitle for a single lesson
 */
async function generateSubtitle(lesson) {
  const { id, code, audio, title } = lesson;
  const outputFile = path.join(SUBTITLES_DIR, `englishpod_${code}.vtt`);

  // Skip if already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⏭️  Skipping ${code} - already exists`);
    return { success: true, skipped: true };
  }

  console.log(`🎙️  Processing ${code}: ${title}`);

  try {
    // Run Whisper command
    // --model: tiny/base/small/medium/large
    // --output_format: vtt (WebVTT format)
    // --language: en (English)
    // --output_dir: where to save
    const command = `whisper "${audio}" --model ${WHISPER_MODEL} --output_format vtt --language en --output_dir "${SUBTITLES_DIR}" --fp16 False`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Whisper saves as <filename>.vtt, need to rename
    const whisperOutput = path.join(
      SUBTITLES_DIR,
      `englishpod_${code}pb.vtt`
    );
    if (fs.existsSync(whisperOutput)) {
      fs.renameSync(whisperOutput, outputFile);
    }

    console.log(`✅ Generated: ${outputFile}`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`❌ Error processing ${code}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Starting subtitle generation with Whisper AI\n");

  // Check if Whisper is installed
  try {
    await execAsync("whisper --help");
  } catch (error) {
    console.error("❌ Whisper is not installed!");
    console.error("Please install: pip install -U openai-whisper");
    console.error("Also install ffmpeg: https://ffmpeg.org/download.html");
    process.exit(1);
  }

  // Load lessons
  const lessons = JSON.parse(fs.readFileSync(LESSONS_FILE, "utf-8"));
  console.log(`📚 Found ${lessons.length} lessons\n`);

  // Process lessons (you can limit for testing)
  const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT) : lessons.length;
  const lessonsToProcess = lessons.slice(0, LIMIT);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < lessonsToProcess.length; i++) {
    const lesson = lessonsToProcess[i];
    console.log(`\n[${i + 1}/${lessonsToProcess.length}]`);

    const result = await generateSubtitle(lesson);

    if (result.success) {
      if (result.skipped) {
        skipCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
    }

    // Add delay to avoid overwhelming the system
    if (i < lessonsToProcess.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ Generated: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});



