// Use legacy build with disableWorker to avoid CORS/worker issues
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import { PitchData } from '@/types/pitch';

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  error?: string;
  extractedText?: string;
}

/**
 * Parse PDF file using legacy pdfjs build with worker disabled
 */
export async function parsePDF(file: File): Promise<ParseResult> {
  try {
    const data = new Uint8Array(await file.arrayBuffer());
    // Use legacy build with worker disabled to avoid CORS issues
    const doc = await pdfjs.getDocument({ 
      data, 
      disableWorker: true, 
      isEvalSupported: false 
    } as any).promise;

    // Extract text from all pages
    const numPages = doc.numPages;
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      } catch (pageErr) {
        console.warn(`Failed to extract text from page ${i}:`, pageErr);
      }
    }

    if (!fullText.trim() || fullText.trim().length < 50) {
      return {
        success: false,
        error: 'PDF 檔案中未找到足夠的文字內容。檔案可能是掃描版、受保護或僅包含圖片。',
      };
    }

    // Parse the extracted text into PitchData
    const pitchData = extractPitchDataFromText(fullText, file.name);
    
    return {
      success: true,
      data: pitchData,
      extractedText: fullText,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    const errorMsg = error instanceof Error ? error.message : '未知錯誤';
    return {
      success: false,
      error: `解析 PDF 時發生錯誤: ${errorMsg}`,
    };
  }
}

/**
 * Parse PPTX file using JSZip to extract slide text
 */
export async function parsePPTX(file: File): Promise<ParseResult> {
  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    
    // Find all slide XML files
    const slides = Object.keys(zip.files).filter(n => /ppt\/slides\/slide\d+\.xml$/.test(n));

    if (slides.length === 0) {
      return {
        success: false,
        error: 'PPTX 檔案中未找到簡報投影片。',
      };
    }

    // Sort slides by number
    slides.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || '0');
      return numA - numB;
    });

    // Extract text from each slide
    let fullText = '';
    for (const slideFile of slides) {
      try {
        const slideXml = await zip.file(slideFile)?.async('text');
        if (slideXml) {
          // Extract text from <a:t> tags (text content in PowerPoint XML)
          const textMatches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
          const slideText = textMatches
            .map(match => {
              const textContent = match.replace(/<a:t[^>]*>([^<]*)<\/a:t>/, '$1');
              return textContent
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");
            })
            .filter(text => text.trim().length > 0)
            .join(' ');
          
          if (slideText.trim()) {
            fullText += slideText + '\n\n';
          }
        }
      } catch (slideErr) {
        console.warn(`Failed to extract text from ${slideFile}:`, slideErr);
      }
    }

    if (!fullText.trim() || fullText.trim().length < 50) {
      return {
        success: false,
        error: 'PPTX 檔案中未找到足夠的文字內容。投影片可能只包含圖片。',
      };
    }

    // Parse the extracted text into PitchData
    const pitchData = extractPitchDataFromText(fullText, file.name);
    
    return {
      success: true,
      data: pitchData,
      extractedText: fullText,
    };
  } catch (error) {
    console.error('PPTX parsing error:', error);
    const errorMsg = error instanceof Error ? error.message : '未知錯誤';
    return {
      success: false,
      error: `解析 PPTX 時發生錯誤: ${errorMsg}。請確認檔案格式正確。`,
    };
  }
}

/**
 * Parse plain text files
 */
export async function parseText(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    
    if (!text.trim() || text.trim().length < 50) {
      return {
        success: false,
        error: '文字檔案是空的或內容過少。',
      };
    }

    const pitchData = extractPitchDataFromText(text, file.name);
    
    return {
      success: true,
      data: pitchData,
      extractedText: text,
    };
  } catch (error) {
    return {
      success: false,
      error: `解析文字檔案時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
    };
  }
}

/**
 * Extract structured pitch data from raw text
 * Even if heuristics fail, put raw text in title/brief so keywords are visible
 */
function extractPitchDataFromText(text: string, fileName: string): PitchData {
  // Extract title - look for common patterns or use first significant line
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Try to find a title-like line (look for key phrases, all caps, or first substantial line)
  let title = '';
  const titlePatterns = [
    /^(.*(?:brief|proposal|提案|簡報|計畫|企劃|creative|campaign|project)[^\n]{0,100})/i,
    /^([A-Z\s]{10,80})/,
    /^([\d]{4}.*(?:GSK|LINE|台啤|品牌|行銷)[^\n]{0,100})/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 10) {
      title = match[1].trim();
      break;
    }
  }
  
  // If no title found, use first line or filename
  if (!title) {
    title = lines[0]?.trim().substring(0, 200) || fileName.replace(/\.[^/.]+$/, '');
  }

  // Extract brief - use first few lines but make sure we capture key content
  // Include up to first 1000 chars to ensure important keywords are visible
  const brief = text.substring(0, 1000).trim();

  // Try to extract key information with simple pattern matching
  const lowerText = text.toLowerCase();
  
  // Look for product/brand name
  let productName = '提案產品';
  const brandMatch = text.match(/(?:品牌|產品|brand|product)[:：\s]+([^\n]{3,50})/i) ||
                     text.match(/(GSK|LINE|台啤|綠生活|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
  if (brandMatch) {
    productName = brandMatch[1].trim();
  }

  // Look for client name
  let clientName = '客戶公司';
  const clientMatch = text.match(/(?:客戶|client|company)[:：\s]+([^\n]{3,50})/i);
  if (clientMatch) {
    clientName = clientMatch[1].trim();
  }

  // Look for metrics/numbers
  const metrics: PitchData['metrics'] = [];
  const numberMatches = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*([萬千百億%元人次]|萬人|thousand|million|billion)/gi);
  if (numberMatches) {
    numberMatches.slice(0, 6).forEach((match, idx) => {
      const parts = match.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(.+)/);
      if (parts) {
        metrics.push({
          name: `指標 ${idx + 1}`,
          value: parseFloat(parts[1].replace(/,/g, '')),
          unit: parts[2].trim(),
          trend: 'up' as const,
        });
      }
    });
  }

  return {
    id: `upload-${Date.now()}`,
    title,
    brief,
    product: {
      name: productName,
      description: brief.substring(0, 200),
      category: '提案項目',
    },
    client: {
      name: clientName,
      industry: '產業',
      background: text.substring(0, 300),
    },
    insights: {
      trends: extractListItems(text, ['趨勢', 'trend', '發現']),
      opportunities: extractListItems(text, ['機會', 'opportunity', '優勢']),
      challenges: extractListItems(text, ['挑戰', 'challenge', '問題']),
    },
    deliverables: extractListItems(text, ['交付', 'deliverable', '產出', '服務']),
    constraints: {
      budget: extractInfo(text, ['預算', 'budget']),
      timeline: extractInfo(text, ['時程', 'timeline', '時間']),
      requirements: extractListItems(text, ['要求', 'requirement', '需求']),
    },
    metrics,
    visuals: [],
    keySummary: {
      objective: brief.substring(0, 200),
      approach: text.substring(0, 300),
      expectedOutcome: text.substring(300, 500) || brief,
    },
  };
}

function extractListItems(text: string, keywords: string[]): string[] {
  const items: string[] = [];
  
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[^\\n]*[：:]?\\s*\\n([\\s\\S]{0,500})`, 'i');
    const match = text.match(regex);
    if (match) {
      const section = match[1];
      const lines = section
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 5 && line.length < 200)
        .slice(0, 5);
      items.push(...lines);
    }
  }
  
  return items.length > 0 ? items.slice(0, 10) : ['從上傳的文件中提取的內容'];
}

function extractInfo(text: string, keywords: string[]): string | undefined {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:\\s]+([^\\n]{3,100})`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return undefined;
}

/**
 * Main file parser that routes to the appropriate parser based on file type
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();
  
  try {
    if (fileName.endsWith('.pdf')) {
      return await parsePDF(file);
    } else if (fileName.endsWith('.pptx')) {
      return await parsePPTX(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return await parseText(file);
    } else {
      return {
        success: false,
        error: '不支援的檔案格式。請上傳 PDF、PPTX、TXT 或 MD 檔案。',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `解析檔案時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
    };
  }
}
