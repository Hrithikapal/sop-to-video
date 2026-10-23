require("dotenv").config();
const fs = require("fs");

const script = JSON.parse(fs.readFileSync("script.json", "utf8"));
const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // "George"

async function tts(text, file) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    }
  );
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  fs.mkdirSync("audio", { recursive: true });
  for (let i = 0; i < script.scenes.length; i++) {
    console.log(`generating scene-${i + 1}...`);
    await tts(script.scenes[i].narration, `audio/scene-${i + 1}.mp3`);
    console.log(`scene-${i + 1}.mp3 done`);
  }
}
main().catch((e) => console.error("FAILED:", e.message));