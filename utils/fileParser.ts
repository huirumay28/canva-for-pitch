import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { PitchData } from '@/types/pitch';

// Configure PDF.js worker - Use local worker file for reliability
if (typeof window !== 'undefined') {
  // Always use /canva-for-pitch basePath for both dev and production
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/canva-for-pitch/pdf.worker.min.mjs`;
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
    
    // Create a copy of the ArrayBuffer to prevent detachment issues
    // The worker transfer can detach the original buffer
    const bufferCopy = arrayBuffer.slice(0);
    const uint8Array = new Uint8Array(bufferCopy);

    // Strategy 1: Try with standard options
    let pdfDoc;
    try {
      pdfDoc = await pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        verbosity: 0,
        disableAutoFetch: false,
        disableStream: false,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/standard_fonts/',
      }).promise;
    } catch (err1) {
      console.warn('Strategy 1 failed, trying strategy 2:', err1);
      
      // Strategy 2: Try with more permissive options and disable streams
      try {
        // Create another copy for the second attempt
        const uint8Array2 = new Uint8Array(arrayBuffer.slice(0));
        pdfDoc = await pdfjsLib.getDocument({
          data: uint8Array2,
          useSystemFonts: false,
          verbosity: 0,
          disableAutoFetch: true,
          disableStream: true,
          disableFontFace: false,
          password: '',
          stopAtErrors: false,
          standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/standard_fonts/',
        }).promise;
      } catch (err2) {
        console.warn('Strategy 2 failed, trying strategy 3:', err2);
        
        // Strategy 3: Try with maximum compatibility options
        try {
          // Create yet another copy for the third attempt
          const uint8Array3 = new Uint8Array(arrayBuffer.slice(0));
          pdfDoc = await pdfjsLib.getDocument({
            data: uint8Array3,
            useSystemFonts: false,
            verbosity: 0,
            disableAutoFetch: true,
            disableStream: true,
            disableFontFace: true,
            password: '',
            stopAtErrors: false,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/standard_fonts/',
          }).promise;
        } catch (err3) {
          console.error('All PDF parsing strategies failed:', err3);
          // Try to extract at least some text info from the error
          const errorMsg = err3 instanceof Error ? err3.message : '未知錯誤';
          return {
            success: false,
            error: `無法解析 PDF 檔案: ${errorMsg}。請嘗試將 PDF 內容複製貼上到文字欄位。`,
          };
        }
      }
    }

    // Extract text from all pages
    const numPages = pdfDoc.numPages;
    let fullText = '';
    let successfulPages = 0;
    
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
        if (pageText.trim()) successfulPages++;
      } catch (pageErr) {
        console.warn(`Failed to extract text from page ${i}:`, pageErr);
      }
    }

    if (!fullText.trim() || successfulPages === 0) {
      return {
        success: false,
        error: 'PDF 檔案中未找到可讀取的文字內容。檔案可能是掃描版或受保護。請嘗試將內容複製貼上。',
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
    const arrayBuffer = await file.arrayBuffer();
    
    // Try loading with different JSZip options for better compatibility
    let zip;
    try {
      // Standard load
      zip = await JSZip.loadAsync(arrayBuffer);
    } catch (err1) {
      console.warn('Standard PPTX load failed, trying permissive mode:', err1);
      
      try {
        // Try with checkCRC32 disabled for potentially damaged files
        zip = await JSZip.loadAsync(arrayBuffer, {
          checkCRC32: false,
        });
      } catch (err2) {
        console.warn('Permissive load failed, trying with Uint8Array:', err2);
        
        try {
          // Try converting to Uint8Array
          const uint8Array = new Uint8Array(arrayBuffer);
          zip = await JSZip.loadAsync(uint8Array, {
            checkCRC32: false,
          });
        } catch (err3) {
          console.error('All PPTX load strategies failed:', err3);
          
          // As a last resort, try to extract just the slide text using regex from raw bytes
          const text = await tryExtractPPTXTextDirect(arrayBuffer);
          if (text) {
            const pitchData = extractPitchDataFromText(text, file.name);
            return {
              success: true,
              data: pitchData,
              extractedText: text,
            };
          }
          
          return {
            success: false,
            error: `無法解析 PPTX 檔案: ${err3 instanceof Error ? err3.message : '未知錯誤'}。請嘗試將簡報內容複製貼上到文字欄位，或另存為不同格式後重試。`,
          };
        }
      }
    }
    
    // Find all slide XML files
    const slideFiles: string[] = [];
    zip.forEach((relativePath, zipEntry) => {
      if (relativePath.match(/ppt\/slides\/slide\d+\.xml$/i)) {
        slideFiles.push(relativePath);
      }
    });

    if (slideFiles.length === 0) {
      return {
        success: false,
        error: 'PPTX 檔案中未找到簡報投影片。檔案可能不是有效的 PowerPoint 格式。',
      };
    }

    // Sort slides by number
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml$/i)?.[1] || '0');
      const numB = parseInt(b.match(/slide(\d+)\.xml$/i)?.[1] || '0');
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
        error: 'PPTX 檔案中未找到可讀取的文字內容。投影片可能只包含圖片。',
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
 * Last resort: try to extract text directly from PPTX bytes using regex
 */
async function tryExtractPPTXTextDirect(arrayBuffer: ArrayBuffer): Promise<string | null> {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(arrayBuffer);
    
    // Look for text patterns that appear in PowerPoint XML
    const matches = text.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
    if (matches && matches.length > 0) {
      const extractedText = matches
        .map(m => m.replace(/<a:t[^>]*>([^<]+)<\/a:t>/, '$1'))
        .filter(t => t.trim().length > 0)
        .join(' ');
      
      if (extractedText.length > 50) {
        console.log('Extracted text directly from PPTX bytes');
        return extractedText;
      }
    }
    
    return null;
  } catch (err) {
    console.warn('Direct text extraction failed:', err);
    return null;
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
