import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import JSZip from 'jszip';
import { PitchData } from '@/types/pitch';

// Initialize PDF.js worker path (required even when disableWorker is true)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  const basePath = window.location.pathname.startsWith('/canva-for-pitch') 
    ? '/canva-for-pitch' 
    : '';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.js`;
}

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  error?: string;
  extractedText?: string;
}

/**
 * Parse uploaded file into PitchData.
 * PDF: pdfjs-dist@4 legacy build with disableWorker (no CDN worker / basePath issues).
 * PPTX/DOCX: JSZip reading Office Open XML text nodes.
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.pdf')) return await parsePDF(file);
    if (name.endsWith('.pptx')) return await parsePPTX(file);
    if (name.endsWith('.docx')) return await parseDOCX(file);
    if (name.endsWith('.txt') || name.endsWith('.md')) {
      const text = await file.text();
      return buildResult(text, file.name);
    }
    return {
      success: false,
      error: '目前支援 PDF、PPTX、DOCX、TXT、MD。請換成其中一種格式，或把文字貼到下方欄位。',
    };
  } catch (error) {
    return {
      success: false,
      error: `檔案解析失敗：${error instanceof Error ? error.message : '未知錯誤'}`,
    };
  }
}

export async function parseTextContent(text: string): Promise<ParseResult> {
  if (!text.trim()) {
    return { success: false, error: '請輸入文字內容' };
  }
  return buildResult(text, 'pasted-text');
}

async function parsePDF(file: File): Promise<ParseResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  // Critical: disableWorker avoids GitHub Pages worker/basePath/CORS failures.
  const pdf = await pdfjsLib.getDocument({
    data,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item: { str?: string }) => item.str || '').join(' ') + '\n\n';
  }

  if (!fullText.trim()) {
    return {
      success: false,
      error: 'PDF 裡沒有可讀文字（可能是掃描圖）。請改貼文字，或提供可選取文字的 PDF。',
    };
  }
  return buildResult(fullText, file.name);
}

async function parsePPTX(file: File): Promise<ParseResult> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideNames = Object.keys(zip.files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = Number(a.match(/slide(\d+)/i)?.[1] || 0);
      const nb = Number(b.match(/slide(\d+)/i)?.[1] || 0);
      return na - nb;
    });

  if (slideNames.length === 0) {
    return { success: false, error: '這個 PPTX 裡找不到投影片文字。' };
  }

  const parts: string[] = [];
  for (const name of slideNames) {
    const xml = await zip.file(name)!.async('string');
    const texts = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((m) => m[1]);
    if (texts.length) parts.push(texts.join(''));
  }

  const fullText = parts.join('\n\n');
  if (!fullText.trim()) {
    return { success: false, error: 'PPTX 投影片沒有可讀文字。' };
  }
  return buildResult(fullText, file.name);
}

async function parseDOCX(file: File): Promise<ParseResult> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const doc = zip.file('word/document.xml');
  if (!doc) {
    return { success: false, error: '這個 DOCX 結構不完整。' };
  }
  const xml = await doc.async('string');
  const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
  const fullText = texts.join('');
  if (!fullText.trim()) {
    return { success: false, error: 'DOCX 沒有可讀文字。' };
  }
  return buildResult(fullText, file.name);
}

function buildResult(rawText: string, sourceId: string): ParseResult {
  const text = rawText.replace(/\u0000/g, '').trim();
  if (text.length < 20) {
    return {
      success: false,
      error: '擷取到的文字太少，無法組成提案。請確認檔案不是空白或純圖片。',
    };
  }

  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const title = (lines[0] || '提案簡報').slice(0, 120);
  const brief = text.slice(0, 800);

  const metrics = extractMetrics(text);
  const bullets = extractBullets(text);

  const data: PitchData = {
    id: `upload-${sourceId}-${Date.now()}`,
    title,
    brief,
    product: {
      name: guessField(text, ['產品', 'Product', '品牌']) || title.slice(0, 40),
      description: brief.slice(0, 240),
      category: '上傳資料',
    },
    client: {
      name: guessField(text, ['客戶', 'Client', '品牌', 'GSK', '台啤']) || '上傳客戶',
      industry: guessField(text, ['產業', 'Industry']) || '未指定',
      background: brief.slice(0, 400),
    },
    insights: {
      trends: bullets.slice(0, 5).length ? bullets.slice(0, 5) : [brief.slice(0, 160)],
      opportunities: bullets.slice(5, 10),
      challenges: bullets.slice(10, 15),
    },
    deliverables: bullets.length ? bullets.slice(0, 8) : [brief.slice(0, 120)],
    constraints: {
      budget: guessField(text, ['預算', 'Budget']),
      timeline: guessField(text, ['時程', 'Timeline', '時程表']),
      requirements: bullets.slice(0, 5),
    },
    metrics: metrics.length
      ? metrics
      : [{ name: '擷取文字量', value: text.length, unit: '字', trend: 'stable' as const }],
    visuals: [],
    keySummary: {
      objective: brief.slice(0, 280),
      approach: bullets[0] || brief.slice(0, 200),
      expectedOutcome: bullets[1] || brief.slice(200, 400) || brief.slice(0, 200),
    },
  };

  return { success: true, data, extractedText: text };
}

function extractMetrics(text: string) {
  const metrics: { name: string; value: number; unit: string; trend?: 'up' | 'down' | 'stable' }[] = [];
  const patterns = [
    /([^\n。，,:]{2,24}?)\s*([0-9]+(?:\.[0-9]+)?)\s*(%|％|萬|億|元)/g,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) && metrics.length < 6) {
      metrics.push({
        name: m[1].trim().slice(-24) || '指標',
        value: Number(m[2]),
        unit: m[3].replace('％', '%'),
        trend: 'stable',
      });
    }
  }
  return metrics;
}

function extractBullets(text: string): string[] {
  const lines = text.split(/\n+/);
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^([•\-\*]|\d+[\.\)、])\s+/.test(t) || (t.length > 12 && t.length < 160)) {
      const cleaned = t.replace(/^([•\-\*]|\d+[\.\)、])\s+/, '');
      if (cleaned.length > 8) out.push(cleaned);
    }
    if (out.length >= 20) break;
  }
  return out;
}

function guessField(text: string, keys: string[]): string | undefined {
  for (const key of keys) {
    const re = new RegExp(`${key}\\s*[:：]?\\s*([^\\n]{2,60})`);
    const m = text.match(re);
    if (m) return m[1].trim();
    if (text.includes(key) && key.length > 2) return key;
  }
  return undefined;
}
