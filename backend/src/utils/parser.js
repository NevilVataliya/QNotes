import pdf from 'pdf-parse/lib/pdf-parse.js';

function isLikelyText(buf, sampleSize = 1024) {
  const len = Math.min(buf.length, sampleSize);
  let controlChars = 0;
  for (let i = 0; i < len; i++) {
    const code = buf[i];
    if (code === 9 || code === 10 || code === 13) continue;
    if (code >= 32 && code <= 126) continue;
    if (code >= 128) continue;
    controlChars++;
    if (controlChars > len * 0.1) return false;
  }
  return true;
}

export async function parseFile(buffer) {
  if (!Buffer.isBuffer(buffer)) return null;

  try {
    // Quick PDF check
    const header4 = buffer.slice(0, 4).toString('utf8', 0, 4);
    if (header4 === '%PDF') {
      const data = await pdf(buffer);
      return data.text || '';
    }

    // Only accept plain-text buffers otherwise
    if (isLikelyText(buffer)) {
      return buffer.toString('utf8');
    }

    return null;
  } catch (err) {
    console.error('[Parser] error parsing buffer:', err);
    return null;
  }
}