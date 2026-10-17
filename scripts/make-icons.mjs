import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length - 4);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x / size, y / size);
      const index = row + 1 + x * 4;
      raw[index] = r;
      raw[index + 1] = g;
      raw[index + 2] = b;
      raw[index + 3] = a;
    }
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function bird(x, y) {
  const inEllipse = (cx, cy, rx, ry) => ((x - cx) ** 2) / rx ** 2 + ((y - cy) ** 2) / ry ** 2 <= 1;
  const cream = [243, 239, 226, 255];
  const ochre = [224, 161, 90, 255];
  const ink = [23, 53, 44, 255];
  if (inEllipse(0.46, 0.56, 0.16, 0.1)) return cream;
  if (inEllipse(0.6, 0.48, 0.075, 0.07)) return cream;
  if (inEllipse(0.34, 0.54, 0.07, 0.025) && y < 0.55) return cream;
  const beak = (x - 0.66) / 0.07;
  if (x >= 0.66 && x <= 0.74 && Math.abs(y - 0.49) <= 0.012 + (1 - beak) * 0.02) return ochre;
  if (inEllipse(0.62, 0.46, 0.012, 0.012)) return ink;
  if (inEllipse(0.5, 0.7, 0.22, 0.012)) return ochre;
  return null;
}

function paint(x, y) {
  const moss = [23, 53, 44, 255];
  const mark = bird(x, y);
  return mark ?? moss;
}

writeFileSync("public/icon-192.png", png(192, paint));
writeFileSync("public/icon-512.png", png(512, paint));
