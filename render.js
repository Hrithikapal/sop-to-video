const fs = require("fs");
const { execSync } = require("child_process");

const script = JSON.parse(fs.readFileSync("script.json", "utf8"));
const n = script.scenes.length;
fs.mkdirSync("clips", { recursive: true });

for (let i = 1; i <= n; i++) {
  console.log(`rendering clip ${i}/${n}...`);
  execSync(
    `ffmpeg -y -loglevel error -loop 1 -i slides/scene-${i}.png -i audio/scene-${i}.mp3 ` +
    `-c:v libx264 -tune stillimage -pix_fmt yuv420p -r 30 ` +
    `-af "apad=pad_dur=0.6" -c:a aac -b:a 128k -shortest clips/scene-${i}.mp4`
  );
}

const list = Array.from({ length: n }, (_, i) => `file 'scene-${i + 1}.mp4'`).join("\n");
fs.writeFileSync("clips/list.txt", list);
execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i clips/list.txt -c copy output.mp4`);
console.log("output.mp4 done");