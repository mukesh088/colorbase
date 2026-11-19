import { MAX_INTERIOR_UPLOAD_BYTES } from "@/lib/interior/catalog";
import { decodeInteriorImage, encodeDisplayImage, resizeRgba } from "@/lib/interior/decode";
import { extractInteriorPalette } from "@/lib/interior/quantize";

export async function analyzeInteriorUpload(file: File | Blob) {
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.byteLength > MAX_INTERIOR_UPLOAD_BYTES) {
    throw new Error("Image must be 4 MB or smaller.");
  }
  const decoded = await decodeInteriorImage(buf);
  const analysis = resizeRgba(decoded.data, decoded.width, decoded.height, 480);
  const colors = extractInteriorPalette(analysis.data, 6);
  if (colors.length < 5) {
    throw new Error("Could not find 5 distinct colors in this photo. Try a clearer room image.");
  }
  const display = await encodeDisplayImage(buf, decoded, 1280);
  return { colors, display, decoded };
}
