const fs = require("fs");
const pdf = require("pdf-parse");

async function extract(path) {
  const data = await pdf(fs.readFileSync(path));
  return data.text.replace(/\n{3,}/g, "\n\n").trim();
}

extract(process.argv[2]).then((text) => {
  fs.writeFileSync("sop.txt", text);
  console.log(text.slice(0, 1500));
});