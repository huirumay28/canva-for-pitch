import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { PitchData } from '@/types/pitch';

// Configure PDF.js worker - use CDN for better compatibility
if (typeof window !== 'undefined') {
  // Use a stable CDN version that matches our installed version
  const pdfjsVersion = '3.11.174'; // Compatible with pdfjs-dist 3.x
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
}

export interface ParseResult {
  success: boolean;
  data?: PitchData;
  error?: string;
  extractedText?: string;
}

/**
 * Parse PDF file using pdf.js with multiple fallback strategies
 */
export async function parsePDF(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Strategy 1: Try with standard options
    let pdfDoc;
    try {
      pdfDoc = await pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        verbosity: 0,
        disableAutoFetch: false,
        disableStream: false,
      }).promise;
    } catch (err1) {
      console.warn('Strategy 1 failed, trying strategy 2:', err1);
      
      // Strategy 2: Try with more permissive options
      try {
        pdfDoc = await pdfjsLib.getDocument({
          data: uint8Array.slice(0), // Create a copy
          useSystemFonts: true,
          verbosity: 0,
          disableAutoFetch: true,
          disableStream: true,
          disableFontFace: false,
          password: '',
        }).promise;
      } catch (err2) {
        console.warn('Strategy 2 failed, trying strategy 3:', err2);
        
        // Strategy 3: Try with worker disabled
        try {
          const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';
          
          pdfDoc = await pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: false,
            verbosity: 0,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
          }).promise;
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        } catch (err3) {
          console.error('All PDF parsing strategies failed:', err3);
          return {
            success: false,
            error: `無法解析 PDF 檔案。檔案可能損壞或使用了不支援的格式。錯誤: ${err3 instanceof Error ? err3.message : '未知錯誤'}`,
          };
        }
      }
    }

    // Extract text from all pages
    const numPages = pdfDoc.numPages;
    let fullText = '';
    
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      } catch (pageErr) {
        console.warn(`Failed to extract text from page ${i}:`, pageErr);
      }
    }

    if (!fullText.trim()) {
      return {
        success: false,
        error: 'PDF 檔案中未找到可讀取的文字內容。',
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
    return {
      success: false,
      error: `解析 PDF 時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
    };
  }
}

/**
 * Parse PPTX file using JSZip to extract slide text
 */
export async function parsePPTX(file: File): Promise<ParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find all slide XML files
    const slideFiles: string[] = [];
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/)) {
        slideFiles.push(relativePath);
      }
    });

    if (slideFiles.length === 0) {
      return {
        success: false,
        error: 'PPTX 檔案中未找到簡報投影片。',
      };
    }

    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || '0');
      return numA - numB;
    });

    // Extract text from each slide
    let fullText = '';
    for (const slideFile of slideFiles) {
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

    if (!fullText.trim()) {
      return {
        success: false,
        error: 'PPTX 檔案中未找到可讀取的文字內容。',
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
    return {
      success: false,
      error: `解析 PPTX 時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}。請確認檔案格式正確。`,
    };
  }
}

/**
 * Parse plain text files
 */
export async function parseText(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    
    if (!text.trim()) {
      return {
        success: false,
        error: '文字檔案是空的。',
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
 * This is a best-effort extraction that creates a reasonable structure
 */
function extractPitchDataFromText(text: string, fileName: string): PitchData {
  // Extract title - look for common patterns or use first significant line
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const title = lines[0]?.trim() || fileName.replace(/\.[^/.]+$/, '');

  // Extract brief - use first paragraph or first few lines
  const brief = lines.slice(0, 5).join(' ').substring(0, 500);

  // Try to extract key information with simple pattern matching
  const lowerText = text.toLowerCase();
  
  // Look for product/brand name
  let productName = '提案產品';
  const brandMatch = text.match(/品牌[:：\s]+([^\n]{3,50})/i) ||
                     text.match(/產品[:：\s]+([^\n]{3,50})/i);
  if (brandMatch) {
    productName = brandMatch[1].trim();
  }

  // Look for client name
  let clientName = '客戶公司';
  const clientMatch = text.match(/客戶[:：\s]+([^\n]{3,50})/i) ||
                      text.match(/公司[:：\s]+([^\n]{3,50})/i);
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
