import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";

/* ================= CONFIG ================= */

const BASE =
  "https://ia800408.us.archive.org/10/items/englishpod_all/";

const TOTAL_LESSONS = 365;

const EXPLICIT_LEVELS = [
  "Elementary",
  "Pre-Intermediate",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
  "Business English"
];

/* ================= HELPERS ================= */

function extractExplicitLevel(text) {
  if (!text) return null;

  for (const level of EXPLICIT_LEVELS) {
    const regex = new RegExp(level.replace("-", "\\s*-?\\s*"), "i");
    if (regex.test(text)) return level;
  }

  if (/Business/i.test(text)) return "Business English";

  return null;
}

function extractCategory(title) {
  if (!title) return null;
  const parts = title.split("-");
  return parts.length > 1 ? parts[0].trim() : null;
}

function cleanTitle(title, levelOrCategory) {
  if (!title) return null;

  let clean = title
    .replace(/^EnglishPod\s*-\s*/i, "")
    .trim();

  if (levelOrCategory) {
    clean = clean
      .replace(levelOrCategory, "")
      .replace(/^-\s*/, "")
      .trim();
  }

  return clean;
}

/* ================= CORE ================= */

async function getLessonMeta(code, id) {
  const url = `${BASE}englishpod_${code}.html`;

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);

    const titleCandidates = [
      $("title").text(),
      $("h1").first().text(),
      $("h2").first().text(),
      $("b").first().text()
    ].filter(Boolean);

    const combinedText =
      titleCandidates.join(" ") + " " + $("body").text();

    // 1️⃣ explicit level
    const explicitLevel = extractExplicitLevel(combinedText);

    // 2️⃣ category from title
    const rawTitle = titleCandidates[0] || "";
    const category = extractCategory(rawTitle);

    // 3️⃣ final level decision
    const level = explicitLevel || category || "Unknown";

    // 4️⃣ clean title
    const title =
      cleanTitle(rawTitle, explicitLevel || category) ||
      `EnglishPod Lesson ${id}`;

    return { title, level, category };
  } catch (err) {
    console.warn(`⚠️ Failed lesson ${id}`);
    return {
      title: `EnglishPod Lesson ${id}`,
      level: "Unknown",
      category: null
    };
  }
}

/* ================= MAIN ================= */

async function generateLessons() {
  const lessons = [];

  for (let i = 1; i <= TOTAL_LESSONS; i++) {
    const code = String(i).padStart(4, "0");

    const { title, level, category } =
      await getLessonMeta(code, i);

    lessons.push({
      id: i,
      code,
      title,
      level,
      category,
      audio: `${BASE}englishpod_${code}pb.mp3`,
      script: `${BASE}englishpod_${code}.html`
    });

    console.log(`✔ ${i} | ${level} | ${title}`);
  }

  fs.writeFileSync(
    "lessons.json",
    JSON.stringify(lessons, null, 2),
    "utf-8"
  );

  console.log("\n✅ lessons.json generated (NO UNKNOWN LEVEL)");
}

generateLessons();