import * as pdfjsLib from 'pdfjs-dist';
import { PitchData } from '@/types/pitch';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  rawText?: string;
  error?: string;
  partial?: boolean;
}

/**
 * Parse uploaded file and extract content into PitchData structure
 */
export async function parseFile(file: File): Promise<ParseResult> {
  try {
    const fileType = file.name.toLowerCase();
    
    if (fileType.endsWith('.pdf')) {
      return await parsePDF(file);
    } else if (fileType.endsWith('.txt') || fileType.endsWith('.md')) {
      return await parseText(file);
    } else {
      return {
        success: false,
        error: '目前僅支援 PDF、TXT、MD 格式的文字檔案'
      };
    }
  } catch (error) {
    console.error('File parsing error:', error);
    return {
      success: false,
      error: `檔案解析失敗：${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
}

/**
 * Parse pasted text content
 */
export async function parseTextContent(text: string): Promise<ParseResult> {
  if (!text.trim()) {
    return {
      success: false,
      error: '請輸入文字內容'
    };
  }

  return extractPitchData(text, 'pasted-text');
}

/**
 * Parse PDF file using pdfjs-dist
 */
async function parsePDF(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return extractPitchData(fullText, file.name);
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: `PDF 解析失敗：${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
}

/**
 * Parse plain text or markdown file
 */
async function parseText(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    return extractPitchData(text, file.name);
  } catch (error) {
    console.error('Text parsing error:', error);
    return {
      success: false,
      error: `文字檔解析失敗：${error instanceof Error ? error.message : '未知錯誤'}`
    };
  }
}

/**
 * Extract structured PitchData from raw text using heuristics
 */
function extractPitchData(rawText: string, sourceId: string): ParseResult {
  const text = rawText.trim();
  
  if (!text) {
    return {
      success: false,
      error: '檔案內容為空'
    };
  }

  // Extract title (first non-empty line or heading)
  const lines = text.split('\n').filter(line => line.trim());
  const title = extractTitle(lines) || '提案簡報';
  
  // Extract brief description (first paragraph or summary)
  const brief = extractBrief(text) || text.substring(0, 300) + (text.length > 300 ? '...' : '');
  
  // Extract metrics (numbers with %, 萬, 元, etc.)
  const metrics = extractMetrics(text);
  
  // Extract deliverables (bullet points, numbered lists)
  const deliverables = extractDeliverables(text);
  
  // Extract sections
  const sections = extractSections(text);
  
  // Build PitchData
  const pitchData: PitchData = {
    id: `parsed-${Date.now()}`,
    title,
    brief,
    product: {
      name: sections.product?.name || extractProductName(text) || '產品名稱',
      description: sections.product?.description || extractProductDescription(text) || '（從檔案內容擷取）',
      category: sections.product?.category || '未分類'
    },
    client: {
      name: sections.client?.name || extractClientName(text) || '客戶名稱',
      industry: sections.client?.industry || '產業類別',
      background: sections.client?.background || extractClientBackground(text) || '客戶背景資訊'
    },
    insights: {
      trends: sections.insights?.trends || extractTrends(text),
      opportunities: sections.insights?.opportunities || extractOpportunities(text),
      challenges: sections.insights?.challenges || extractChallenges(text)
    },
    deliverables: deliverables.length > 0 ? deliverables : ['從檔案內容擷取的交付項目'],
    constraints: {
      budget: extractBudget(text),
      timeline: extractTimeline(text),
      requirements: extractRequirements(text)
    },
    metrics,
    visuals: [],
    keySummary: {
      objective: sections.keySummary?.objective || extractObjective(text) || '提案目標',
      approach: sections.keySummary?.approach || extractApproach(text) || '執行方法',
      expectedOutcome: sections.keySummary?.expectedOutcome || extractExpectedOutcome(text) || '預期成果'
    }
  };

  return {
    success: true,
    data: pitchData,
    rawText: text,
    partial: true
  };
}

// Helper functions for text extraction

function extractTitle(lines: string[]): string | null {
  if (lines.length === 0) return null;
  
  // Look for markdown heading
  for (const line of lines) {
    if (line.startsWith('#')) {
      return line.replace(/^#+\s*/, '').trim();
    }
  }
  
  // Use first non-empty line if it's short and looks like a title
  const firstLine = lines[0].trim();
  if (firstLine.length < 100 && !firstLine.endsWith('.') && !firstLine.endsWith('。')) {
    return firstLine;
  }
  
  return null;
}

function extractBrief(text: string): string | null {
  // Look for sections labeled as brief/summary/overview
  const briefPatterns = [
    /(?:簡介|摘要|概述|brief|summary|overview)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i,
    /(?:專案|project)\s*(?:簡介|brief)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of briefPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Get first paragraph
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length > 1) {
    // Skip title-like first paragraph
    const secondPara = paragraphs[1].trim();
    if (secondPara.length > 50) {
      return secondPara.substring(0, 500);
    }
  }
  
  return null;
}

function extractMetrics(text: string): PitchData['metrics'] {
  const metrics: PitchData['metrics'] = [];
  
  // Pattern: number + unit (%, 萬, 億, 元, NT$, etc.)
  const patterns = [
    /(\d+(?:\.\d+)?)\s*%/g,
    /(?:NT\$|TWD|NT\s*\$)?\s*(\d+(?:\.\d+)?)\s*萬/g,
    /(?:NT\$|TWD|NT\s*\$)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*元/g,
    /(\d+(?:\.\d+)?)\s*億/g
  ];
  
  const metricNames = ['指標', '目標', '數據', '成效'];
  let metricIndex = 0;
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null && metrics.length < 10) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      const fullMatch = match[0];
      
      let unit = '%';
      let adjustedValue = value;
      
      if (fullMatch.includes('萬')) {
        unit = '萬';
      } else if (fullMatch.includes('億')) {
        unit = '億';
      } else if (fullMatch.includes('元')) {
        unit = '元';
      }
      
      // Try to find context/label before the number
      const beforeText = text.substring(Math.max(0, match.index - 50), match.index);
      const contextMatch = beforeText.match(/([^\n。，、]+)$/);
      const label = contextMatch ? contextMatch[1].trim() : metricNames[metricIndex % metricNames.length];
      
      metrics.push({
        name: label || `指標 ${metricIndex + 1}`,
        value: adjustedValue,
        unit,
        trend: 'up'
      });
      
      metricIndex++;
    }
  }
  
  return metrics.slice(0, 6); // Limit to 6 metrics
}

function extractDeliverables(text: string): string[] {
  const deliverables: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletPatterns = [
    /^[\s]*[•\-\*]\s+(.+)$/gm,
    /^[\s]*\d+[\.)]\s+(.+)$/gm
  ];
  
  for (const pattern of bulletPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null && deliverables.length < 20) {
      const item = match[1].trim();
      if (item.length > 5 && item.length < 200) {
        deliverables.push(item);
      }
    }
  }
  
  return deliverables.slice(0, 12);
}

function extractSections(text: string): any {
  return {
    product: null,
    client: null,
    insights: null,
    keySummary: null
  };
}

function extractProductName(text: string): string | null {
  const patterns = [
    /(?:產品|product|品牌|brand)[名稱\s]*[：:]\s*([^\n]+)/i,
    /(?:品牌|brand)\s*[：:]?\s*([A-Z][A-Za-z\s]+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100);
    }
  }
  
  return null;
}

function extractProductDescription(text: string): string | null {
  const patterns = [
    /(?:產品|product)\s*(?:說明|description|簡介)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 300);
    }
  }
  
  return null;
}

function extractClientName(text: string): string | null {
  const patterns = [
    /(?:客戶|client|公司|company)[名稱\s]*[：:]\s*([^\n]+)/i,
    /(?:for|為)\s+([A-Z][A-Za-z\s&]+)(?:公司|Co\.|Ltd\.|Inc\.)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100);
    }
  }
  
  return null;
}

function extractClientBackground(text: string): string | null {
  const patterns = [
    /(?:客戶|client)\s*(?:背景|background)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i,
    /(?:公司|company)\s*(?:簡介|介紹|background)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500);
    }
  }
  
  return null;
}

function extractTrends(text: string): string[] {
  return extractListItems(text, ['趨勢', 'trend', '潮流']);
}

function extractOpportunities(text: string): string[] {
  return extractListItems(text, ['機會', 'opportunit', '優勢', 'strength']);
}

function extractChallenges(text: string): string[] {
  return extractListItems(text, ['挑戰', 'challenge', '問題', 'issue', '困難']);
}

function extractListItems(text: string, keywords: string[]): string[] {
  const items: string[] = [];
  
  for (const keyword of keywords) {
    const sectionMatch = text.match(new RegExp(`${keyword}[^\\n]*[：:]([\\s\\S]*?)(?=\\n\\n|\\n[\\u4e00-\\u9fff]+[：:]|$)`, 'i'));
    if (sectionMatch) {
      const sectionText = sectionMatch[1];
      const bulletPoints = sectionText.match(/^[\s]*[•\-\*]\s+(.+)$/gm);
      if (bulletPoints) {
        items.push(...bulletPoints.map(bp => bp.replace(/^[\s]*[•\-\*]\s+/, '').trim()));
      }
    }
  }
  
  return items.slice(0, 5);
}

function extractBudget(text: string): string | undefined {
  const patterns = [
    /(?:預算|budget)[：:]\s*((?:NT\$|TWD)?\s*[\d,]+\s*(?:萬|億|元))/i,
    /(NT\$\s*[\d,]+\s*(?:萬|億))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractTimeline(text: string): string | undefined {
  const patterns = [
    /(?:時程|timeline|期程)[：:]\s*([^\n]+)/i,
    /(\d+\s*(?:週|周|月|個月|weeks?|months?))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

function extractRequirements(text: string): string[] {
  return extractListItems(text, ['要求', 'requirement', '條件', 'condition']);
}

function extractObjective(text: string): string | null {
  const patterns = [
    /(?:目標|objective|goal)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500);
    }
  }
  
  return null;
}

function extractApproach(text: string): string | null {
  const patterns = [
    /(?:方法|approach|策略|strategy)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i,
    /(?:執行|execution)\s*(?:方式|方法)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500);
    }
  }
  
  return null;
}

function extractExpectedOutcome(text: string): string | null {
  const patterns = [
    /(?:預期|expected)\s*(?:成果|outcome|結果|result)[：:]\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500);
    }
  }
  
  return null;
}
