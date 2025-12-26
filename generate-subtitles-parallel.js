/**
 * Generate subtitle files using Whisper AI with PARALLEL PROCESSING
 * 
 * This optimized version processes multiple lessons simultaneously
 * to significantly reduce total generation time.
 * 
 * Prerequisites:
 * 1. Install Python 3.8+
 * 2. Install Whisper: pip install -U openai-whisper
 * 3. Install ffmpeg: https://ffmpeg.org/download.html
 * 
 * Usage:
 *   node generate-subtitles-parallel.js
 * 
 * Environment Variables:
 *   LIMIT=10          - Process only first N lessons (for testing)
 *   CONCURRENCY=4     - Number of parallel processes (default: 4)
 */

import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

const LESSONS_FILE = "lessons.json";
const SUBTITLES_DIR = "subtitles";
const WHISPER_MODEL = "tiny"; // tiny, base, small, medium, large
const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 4; // Parallel processes

// Ensure subtitles directory exists
if (!fs.existsSync(SUBTITLES_DIR)) {
  fs.mkdirSync(SUBTITLES_DIR, { recursive: true });
}

/**
 * Generate subtitle for a single lesson
 */
async function generateSubtitle(lesson, index, total) {
  const { id, code, audio, title } = lesson;
  const outputFile = path.join(SUBTITLES_DIR, `englishpod_${code}.vtt`);

  // Skip if already exists
  if (fs.existsSync(outputFile)) {
    console.log(`⏭️  [${index}/${total}] Skipping ${code} - already exists`);
    return { success: true, skipped: true, code };
  }

  console.log(`🎙️  [${index}/${total}] Processing ${code}: ${title}`);

  try {
    // Run Whisper command
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

    console.log(`✅ [${index}/${total}] Generated: ${code}`);
    return { success: true, skipped: false, code };
  } catch (error) {
    console.error(`❌ [${index}/${total}] Error processing ${code}:`, error.message);
    return { success: false, error: error.message, code };
  }
}

/**
 * Process lessons in parallel batches
 */
async function processBatch(lessons, startIndex, total) {
  const promises = lessons.map((lesson, idx) =>
    generateSubtitle(lesson, startIndex + idx, total)
  );
  return await Promise.all(promises);
}

/**
 * Split array into chunks for batch processing
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  console.log("🚀 Starting PARALLEL subtitle generation with Whisper AI");
  console.log(`⚡ Concurrency: ${CONCURRENCY} parallel processes\n`);

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

  console.log(`📊 Processing ${lessonsToProcess.length} lessons in batches of ${CONCURRENCY}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Split into batches
  const batches = chunkArray(lessonsToProcess, CONCURRENCY);
  let processedCount = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchStartIndex = processedCount + 1;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📦 Batch ${i + 1}/${batches.length} (${batch.length} lessons)`);
    console.log(`${"=".repeat(60)}\n`);

    const results = await processBatch(batch, batchStartIndex, lessonsToProcess.length);

    // Count results
    results.forEach((result) => {
      if (result.success) {
        if (result.skipped) {
          skipCount++;
        } else {
          successCount++;
        }
      } else {
        errorCount++;
      }
    });

    processedCount += batch.length;

    // Show progress
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const avgTimePerLesson = (Date.now() - startTime) / processedCount / 1000;
    const remainingLessons = lessonsToProcess.length - processedCount;
    const estimatedMinutesLeft = (remainingLessons * avgTimePerLesson / 60).toFixed(1);

    console.log(`\n📈 Progress: ${processedCount}/${lessonsToProcess.length} (${((processedCount / lessonsToProcess.length) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Elapsed: ${elapsed} minutes`);
    console.log(`⚡ Avg: ${avgTimePerLesson.toFixed(1)}s per lesson`);
    console.log(`⏳ Estimated time remaining: ${estimatedMinutesLeft} minutes`);
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY:");
  console.log("=".repeat(60));
  console.log(`   ✅ Generated: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⏱️  Total Time: ${totalTime} minutes`);
  console.log(`   ⚡ Speed: ${(lessonsToProcess.length / parseFloat(totalTime)).toFixed(1)} lessons/minute`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

