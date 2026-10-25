import { jsPDF } from 'jspdf';

// In-memory cache for font Base64 data so subsequent PDF downloads are instantaneous
const fontBase64Cache = new Map<string, string>();

/**
 * Loads a TTF font file as a Base64 string.
 * Supports both client-side browser fetch and Node.js filesystem (for verification/SSR).
 */
async function loadFontAsBase64(fontFileName: string): Promise<string> {
  if (fontBase64Cache.has(fontFileName)) {
    return fontBase64Cache.get(fontFileName)!;
  }

  // 1. Try Node fs if running in Node.js test environment
  if (typeof window === 'undefined' || typeof (globalThis as any).process?.versions?.node !== 'undefined') {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const localPath = path.resolve(process.cwd(), 'public/fonts', fontFileName);
      if (fs.existsSync(localPath)) {
        const b64 = fs.readFileSync(localPath).toString('base64');
        fontBase64Cache.set(fontFileName, b64);
        return b64;
      }
    } catch {
      // Fallback to fetch
    }
  }

  // 2. Client-side browser fetch from /fonts/
  const url = `/fonts/${fontFileName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load font ${fontFileName} from ${url}: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Chunked binary string conversion to avoid stack overflows on large buffers
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as any);
  }

  const base64 = btoa(binary);
  fontBase64Cache.set(fontFileName, base64);
  return base64;
}

export interface FontConfig {
  fontFamily: string;
  isCustomUnicode: boolean;
}

/**
 * Registers appropriate Unicode TrueType fonts (Devanagari, Tamil, etc.) with jsPDF
 * based on the target report language.
 */
export async function registerPdfFonts(doc: jsPDF, language: string = 'hi'): Promise<FontConfig> {
  const lang = (language || 'hi').toLowerCase();

  // Languages using Devanagari script: Hindi, Marathi, Sanskrit
  // (and default Vedic spiritual fallback for other Indic scripts)
  const isDevanagari = ['hi', 'mr', 'sa', 'gu', 'bn', 'kn', 'te', 'ml', 'pa', 'or', 'as'].includes(lang);
  const isTamil = lang === 'ta';

  if (isTamil) {
    try {
      const regularB64 = await loadFontAsBase64('NotoSansTamil-Regular.ttf');
      const boldB64 = await loadFontAsBase64('NotoSansTamil-Bold.ttf');

      doc.addFileToVFS('NotoSansTamil-Regular.ttf', regularB64);
      doc.addFont('NotoSansTamil-Regular.ttf', 'NotoSansTamil', 'normal');

      doc.addFileToVFS('NotoSansTamil-Bold.ttf', boldB64);
      doc.addFont('NotoSansTamil-Bold.ttf', 'NotoSansTamil', 'bold');

      return { fontFamily: 'NotoSansTamil', isCustomUnicode: true };
    } catch (err) {
      console.warn('Failed to load Tamil fonts, falling back to standard font:', err);
      return { fontFamily: 'helvetica', isCustomUnicode: false };
    }
  }

  if (isDevanagari) {
    try {
      const regularB64 = await loadFontAsBase64('NotoSansDevanagari-Regular.ttf');
      const boldB64 = await loadFontAsBase64('NotoSansDevanagari-Bold.ttf');

      doc.addFileToVFS('NotoSansDevanagari-Regular.ttf', regularB64);
      doc.addFont('NotoSansDevanagari-Regular.ttf', 'NotoSansDevanagari', 'normal');

      doc.addFileToVFS('NotoSansDevanagari-Bold.ttf', boldB64);
      doc.addFont('NotoSansDevanagari-Bold.ttf', 'NotoSansDevanagari', 'bold');

      return { fontFamily: 'NotoSansDevanagari', isCustomUnicode: true };
    } catch (err) {
      console.warn('Failed to load Devanagari fonts, falling back to standard font:', err);
      return { fontFamily: 'helvetica', isCustomUnicode: false };
    }
  }

  // English uses standard built-in font
  return { fontFamily: 'helvetica', isCustomUnicode: false };
}
