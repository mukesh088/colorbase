const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const svg = fs.readFileSync(path.join("public", "favicon.svg"));
const out = "public";

async function png(size, name) {
  await sharp(svg).resize(size, size).png().toFile(path.join(out, name));
  console.log("wrote", name);
}

function icoFromPngs(pngs, dims) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  pngs.forEach((png, i) => {
    const dim = dims[i];
    dir.writeUInt8(dim >= 256 ? 0 : dim, i * 16 + 0);
    dir.writeUInt8(dim >= 256 ? 0 : dim, i * 16 + 1);
    dir.writeUInt8(0, i * 16 + 2);
    dir.writeUInt8(0, i * 16 + 3);
    dir.writeUInt16LE(1, i * 16 + 4);
    dir.writeUInt16LE(32, i * 16 + 6);
    dir.writeUInt32LE(png.length, i * 16 + 8);
    dir.writeUInt32LE(offset, i * 16 + 12);
    offset += png.length;
  });
  return Buffer.concat([header, dir, ...pngs]);
}

(async () => {
  await png(16, "favicon-16x16.png");
  await png(32, "favicon-32x32.png");
  await png(180, "apple-touch-icon.png");
  await png(192, "icon-192.png");
  await png(512, "icon-512.png");
  // Brand mark used by JSON-LD / social fallbacks
  await png(512, "og-default.png");

  const b16 = await sharp(svg).resize(16, 16).png().toBuffer();
  const b32 = await sharp(svg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(out, "favicon.ico"), icoFromPngs([b16, b32], [16, 32]));
  console.log("wrote favicon.ico");
})();
