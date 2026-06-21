/**
 * Convert a selected image File into a downscaled base64 data URL.
 *
 * Why client-side downscale instead of a presigned S3 upload:
 *  - The vision model (gpt-4o) must be able to READ the image. A presigned
 *    upload to a localhost / private bucket isn't reachable by OpenAI, so the
 *    only reliable path for a demo is to send the bytes inline as a data URL.
 *  - Downscaling to ~1024px keeps the payload small (≈100-200KB) which keeps
 *    both the request body and the vision-token cost down, with no visible
 *    quality loss for product identification.
 *
 * Returns a `data:image/jpeg;base64,...` string.
 */
export async function imageFileToDataUrl(
  file: File,
  maxDimension = 1024,
  quality = 0.82,
): Promise<string> {
  const bitmap = await loadBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDimension);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Fallback: no canvas → return the raw file as a data URL untouched.
    return readAsDataUrl(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

function fitWithin(w: number, h: number, max: number) {
  if (w <= max && h <= max) return { width: w, height: h };
  const ratio = w > h ? max / w : max / h;
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap is fast and avoids an <img> roundtrip where supported.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
