require("dotenv").config();
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sop = fs.readFileSync("sop.txt", "utf8");
const LANG = process.argv[2] || "English";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      return await fn();
    } catch (err) {
      const code = err.status || err.cause?.code;
      const retryable = code === 503 || code === 429 || code === "ECONNRESET";
      if (!retryable || i === tries) throw err;
      const wait = 3000 * i;
      console.log(`⚠️  Gemini ${code} — retrying ${i}/${tries - 1} in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

const prompt = `You write scripts for 60-90 second vertical (9:16) training videos for frontline workers in India.
Turn the SOP below into 6-8 scenes. Each scene has:
- "title": max 6 words, in English, shown on screen
- "caption": 1 short English sentence shown on screen, max 15 words
- "narration": 1-2 short spoken sentences in ${LANG}, max 25 words. If ${LANG} is not English, write it in that language's native script, simple everyday words a delivery worker would use.

First scene is a one-line hook, last scene is a one-line recap.
Return ONLY JSON in this shape: {"videoTitle": string, "scenes": [{"title": string, "caption": string, "narration": string}]}

SOP:
${sop}`;

async function main() {
    const res = await withRetry(() => ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  }));
  const script = JSON.parse(res.text);
  fs.writeFileSync("script.json", JSON.stringify(script, null, 2));
  console.log(JSON.stringify(script, null, 2));
}
main();