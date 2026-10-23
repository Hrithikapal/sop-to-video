const { execSync } = require("child_process");

const pdf = process.argv[2];
const lang = process.argv[3] || "English";
if (!pdf) {
  console.error('usage: node pipeline.js "your-file.pdf"');
  process.exit(1);
}

const t0 = Date.now();
const run = (cmd) => {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

run(`node extract.js "${pdf}"`);
run(`node script.js "${lang}"`);
run("node tts.js");
run("node slides.js");
run("node render.js");
run(
  "ffmpeg -y -loglevel error -i output.mp4 -vf scale=720:1280 -c:v libx264 -crf 28 " +
  "-preset slow -c:a aac -b:a 64k -movflags +faststart final.mp4"
);

console.log(`\n✅ final.mp4 ready in ${Math.round((Date.now() - t0) / 1000)}s`);