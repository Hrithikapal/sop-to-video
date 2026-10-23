const fs = require("fs");
const sharp = require("sharp");

const script = JSON.parse(fs.readFileSync("script.json", "utf8"));
const W = 1080, H = 1920;
const FONT = "Helvetica, Arial, sans-serif";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > max) { lines.push(line.trim()); line = word; }
    else line += " " + word;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function slideSvg(scene, i, total) {
  const title = wrap(scene.title, 16);
  const body = wrap(scene.caption || scene.narration, 30);
  const titleY = 760 - (title.length - 1) * 50;
  const titleLines = title.map((l, k) => `<tspan x="540" dy="${k ? 100 : 0}">${esc(l)}</tspan>`).join("");
  const bodyLines = body.map((l, k) => `<tspan x="540" dy="${k ? 66 : 0}">${esc(l)}</tspan>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0f172a"/>
  <rect width="${W}" height="18" fill="#2563eb"/>
  <text x="540" y="300" text-anchor="middle" font-family="${FONT}" font-size="40" fill="#93c5fd" letter-spacing="6">${i} / ${total}</text>
  <text x="540" y="${titleY}" text-anchor="middle" font-family="${FONT}" font-size="84" font-weight="bold" fill="#ffffff">${titleLines}</text>
  <rect x="80" y="1280" width="920" height="${120 + body.length * 66}" rx="28" fill="#1e293b"/>
  <text x="540" y="1370" text-anchor="middle" font-family="${FONT}" font-size="50" fill="#f1f5f9">${bodyLines}</text>
  <text x="540" y="1820" text-anchor="middle" font-family="${FONT}" font-size="34" fill="#64748b">${esc(script.videoTitle)}</text>
</svg>`;
}

async function main() {
  fs.mkdirSync("slides", { recursive: true });
  const total = script.scenes.length;
  for (let i = 0; i < total; i++) {
    await sharp(Buffer.from(slideSvg(script.scenes[i], i + 1, total)))
      .png()
      .toFile(`slides/scene-${i + 1}.png`);
    console.log(`slides/scene-${i + 1}.png done`);
  }
}
main().catch((e) => console.error("FAILED:", e.message));