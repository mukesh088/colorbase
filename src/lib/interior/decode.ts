import { MAX_INTERIOR_UPLOAD_BYTES } from "@/lib/interior/catalog";

export type DecodedImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  mime: "image/jpeg" | "image/png" | "image/webp";
};

function sniffMime(buf: Buffer): DecodedImage["mime"] | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  )
    return "image/png";
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export function resizeRgba(
  src: Uint8ClampedArray,
  width: number,
  height: number,
  maxEdge: number
) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  if (w === width && h === height) return { width: w, height: h, data: src };
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = Math.min(height - 1, Math.floor((y + 0.5) * (height / h)));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, Math.floor((x + 0.5) * (width / w)));
      const si = (sy * width + sx) * 4;
      const di = (y * w + x) * 4;
      out[di] = src[si];
      out[di + 1] = src[si + 1];
      out[di + 2] = src[si + 2];
      out[di + 3] = src[si + 3];
    }
  }
  return { width: w, height: h, data: out };
}

async function trySharp(buf: Buffer): Promise<DecodedImage | null> {
  try {
    const sharp = (await import("sharp")).default;
    const image = sharp(buf, { failOn: "none", sequentialRead: true });
    const meta = await image.metadata();
    const mime =
      meta.format === "jpeg"
        ? "image/jpeg"
        : meta.format === "png"
          ? "image/png"
          : meta.format === "webp"
            ? "image/webp"
            : null;
    if (!mime) return null;
    const { data, info } = await image
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return {
      width: info.width,
      height: info.height,
      data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
      mime,
    };
  } catch {
    return null;
  }
}

export async function decodeInteriorImage(buf: Buffer): Promise<DecodedImage> {
  if (buf.byteLength > MAX_INTERIOR_UPLOAD_BYTES) {
    throw new Error("Image must be 4 MB or smaller.");
  }
  const sniffed = sniffMime(buf);
  if (!sniffed) throw new Error("Use a JPEG, PNG, or WebP photo.");

  const viaSharp = await trySharp(buf);
  if (viaSharp) {
    if (viaSharp.mime !== sniffed) throw new Error("File contents do not match a JPEG, PNG, or WebP photo.");
    return viaSharp;
  }

  if (sniffed === "image/jpeg") {
    const jpegMod = (await import("jpeg-js")) as {
      decode?: (data: Buffer, opts?: object) => { width: number; height: number; data: Buffer | Uint8Array };
      default?: { decode: (data: Buffer, opts?: object) => { width: number; height: number; data: Buffer | Uint8Array } };
    };
    const decode = jpegMod.decode ?? jpegMod.default?.decode;
    if (!decode) throw new Error("JPEG decoder is not available.");
    const raw = decode(buf, { maxMemoryUsageInMB: 48, useTArray: true });
    return {
      width: raw.width,
      height: raw.height,
      data: Uint8ClampedArray.from(raw.data),
      mime: "image/jpeg",
    };
  }
  if (sniffed === "image/png") {
    const { PNG } = await import("pngjs");
    const raw = PNG.sync.read(buf);
    return {
      width: raw.width,
      height: raw.height,
      data: Uint8ClampedArray.from(raw.data),
      mime: "image/png",
    };
  }
  throw new Error("WebP needs the sharp package on the server. Upload JPEG or PNG, or install sharp.");
}

export async function encodeDisplayImage(
  original: Buffer,
  decoded: DecodedImage,
  maxEdge = 1280
) {
  const resized = resizeRgba(decoded.data, decoded.width, decoded.height, maxEdge);
  try {
    const sharp = (await import("sharp")).default;
    const bytes = await sharp(Buffer.from(resized.data), {
      raw: { width: resized.width, height: resized.height, channels: 4 },
    })
      .webp({ quality: 78 })
      .toBuffer();
    return { bytes, mime: "image/webp" as const, width: resized.width, height: resized.height };
  } catch {
    if (decoded.mime === "image/webp") {
      throw new Error("Could not recompress this WebP. Upload JPEG or PNG, or install sharp on the server.");
    }
    return {
      bytes: original,
      mime: decoded.mime,
      width: decoded.width,
      height: decoded.height,
    };
  }
}
