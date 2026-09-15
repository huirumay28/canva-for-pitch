import { PitchData } from '@/types/pitch';

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  error?: string;
  extractedText?: string;
}

type PdfJsLib = {
  getDocument: (src: object) => { promise: Promise<any> };
  GlobalWorkerOptions: { workerSrc: string };
};

let pdfjsLoader: Promise<PdfJsLib> | null = null;

function loadPdfJsFromCdn(): Promise<PdfJsLib> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PDF 解析只能在瀏覽器中執行'));
  }
  const w = window as Window & { pdfjsLib?: PdfJsLib };
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (pdfjsLoader) return pdfjsLoader;

  pdfjsLoader = new Promise<PdfJsLib>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-pdfjs="4.10.38"]');
    if (existing && w.pdfjsLib) {
      resolve(w.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.js';
    script.async = true;
    script.dataset.pdfjs = '4.10.38';
    script.onload = () => {
      const lib = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (!lib) {
        reject(new Error('pdf.js 載入後仍無法使用'));
        return;
      }
      lib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js';
      resolve(lib);
    };
    script.onerror = () => reject(new Error('無法從 CDN 載入 pdf.js'));
    document.head.appendChild(script);
  });
  return pdfjsLoader;
}

export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith('.pdf')) return await parsePDF(file);
    if (name.endsWith('.txt') || name.endsWith('.md')) {
      return buildResult(await file.text(), file.name);
    }
    return {
      success: false,
      error: '目前只支援 PDF、TXT、MD。請上傳 PDF，或把文字貼到下方欄位。',
    };
  } catch (error) {
    return {
      success: false,
      error: `檔案解析失敗：${error instanceof Error ? error.message : '未知錯誤'}`,
    };
  }
}

export async function parseTextContent(text: string): Promise<ParseResult> {
  if (!text.trim()) return { success: false, error: '請輸入文字內容' };
  return buildResult(text, 'pasted-text');
}

async function parsePDF(file: File): Promise<ParseResult> {
  const pdfjsLib = await loadPdfJsFromCdn();
  const data = new Uint8Array(await file.arrayBuffer());

  // Try data buffer first, then object URL (helps some PDF structures).
  let pdfDoc: any;
  try {
    pdfDoc = await pdfjsLib.getDocument({
      data,
      verbosity: 0,
      isEvalSupported: false,
      useSystemFonts: true,
      stopAtErrors: false,
    }).promise;
  } catch (err1) {
    const url = URL.createObjectURL(file);
    try {
      pdfDoc = await pdfjsLib.getDocument({
        url,
        verbosity: 0,
        isEvalSupported: false,
        useSystemFonts: true,
        stopAtErrors: false,
      }).promise;
    } catch (err2) {
      URL.revokeObjectURL(url);
      const msg = err2 instanceof Error ? err2.message : '未知錯誤';
      return {
        success: false,
        error: `這個 PDF 讀取失敗（${msg}）。請改存成「文字可選取」的 PDF，或把內容貼到下方文字欄。`,
      };
    }
    URL.revokeObjectURL(url);
  }

  let fullText = '';
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item: { str?: string }) => item.str || '').join(' ') + '\n\n';
    } catch {
      // skip bad page
    }
  }

  if (!fullText.trim()) {
    return {
      success: false,
      error: 'PDF 裡沒有可讀文字（可能是掃描圖）。請改貼文字，或提供可選取文字的 PDF。',
    };
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
      name: guessField(text, ['產品', 'Product', '品牌', 'GSK']) || title.slice(0, 40),
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
      timeline: guessField(text, ['時程', 'Timeline']),
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
  const re = /([^\n。，,:]{2,24}?)\s*([0-9]+(?:\.[0-9]+)?)\s*(%|％|萬|億|元)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && metrics.length < 6) {
    metrics.push({
      name: m[1].trim().slice(-24) || '指標',
      value: Number(m[2]),
      unit: m[3].replace('％', '%'),
      trend: 'stable',
    });
  }
  return metrics;
}

function extractBullets(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\n+/)) {
    const t = line.trim();
    const cleaned = t.replace(/^([•\-\*]|\d+[\.\)、])\s+/, '');
    if (cleaned.length > 8 && cleaned.length < 160) out.push(cleaned);
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
