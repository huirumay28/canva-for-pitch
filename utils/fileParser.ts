import * as pdfjsLib from 'pdfjs-dist';
import { PitchData } from '@/types/pitch';

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  error?: string;
  extractedText?: string;
}

// Configure pdf.js worker for GitHub Pages static export
let workerConfigured = false;

function configurePdfJsWorker() {
  if (workerConfigured) return;
  
  // Set worker to local file in public folder (copied during build)
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/canva-for-pitch/pdf.worker.min.js';
  
  console.log('[DEBUG] pdf.js version:', (pdfjsLib as any).version);
  console.log('[DEBUG] workerSrc configured:', (pdfjsLib as any).GlobalWorkerOptions.workerSrc);
  
  workerConfigured = true;
}

/**
 * Parse uploaded file into PitchData.
 * PDF: pdfjs-dist@4 legacy build with disableWorker (no CDN worker / basePath issues).
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.pdf')) return await parsePDF(file);
    if (name.endsWith('.txt') || name.endsWith('.md')) {
      const text = await file.text();
      return buildResult(text, file.name);
    }
    return {
      success: false,
      error: '目前支援 PDF、TXT、MD。請換成其中一種格式，或把文字貼到下方欄位。',
    };
  } catch (error) {
    console.error('[DEBUG] parseFile exception:', error);
    console.error('[DEBUG] Exception stack:', error instanceof Error ? error.stack : String(error));
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
  try {
    // Configure worker on first use
    configurePdfJsWorker();
    
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    console.log('[DEBUG] PDF file name:', file.name);
    console.log('[DEBUG] PDF file size:', data.length, 'bytes');
    console.log('[DEBUG] First 8 bytes:', Array.from(data.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    const loadingTask = pdfjsLib.getDocument({ 
      data,
      verbosity: 0,
    });
    const pdf = await loadingTask.promise;
    console.log('[DEBUG] PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
        fullText += pageText + '\n\n';
        if (i === 1) {
          console.log('[DEBUG] Page 1 text length:', pageText.length);
          console.log('[DEBUG] Page 1 first 80 chars:', pageText.slice(0, 80));
        }
      } catch (pageError) {
        console.error(`[DEBUG] Error on page ${i}:`, pageError);
      }
    }

    if (!fullText.trim()) {
      return {
        success: false,
        error: 'PDF 裡沒有可讀文字（可能是掃描圖）。請改貼文字，或提供可選取文字的 PDF。',
      };
    }
    
    console.log('[DEBUG] Total extracted text length:', fullText.length);
    return buildResult(fullText, file.name);
  } catch (error) {
    console.error('[DEBUG] parsePDF exception:', error);
    console.error('[DEBUG] Exception type:', error?.constructor?.name);
    console.error('[DEBUG] Exception message:', error instanceof Error ? error.message : String(error));
    console.error('[DEBUG] Full stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
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
