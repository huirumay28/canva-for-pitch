'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Image, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { parseFile, parseTextContent, ParseResult } from '@/utils/fileParser';
import { PitchData } from '@/types/pitch';

interface UploadStepProps {
  onUploadComplete: (fileName: string | null, pitchData?: PitchData) => void;
}

export function UploadStep({ onUploadComplete }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<PitchData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFileRef = useRef<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setParseError(null);
    setUploadedFile(file.name);
    currentFileRef.current = file;

    console.log('[DEBUG] Processing file:', file.name, 'Size:', file.size, 'bytes');

    try {
      const result: ParseResult = await parseFile(file);
      
      if (result.success && result.data) {
        console.log('[DEBUG] Parse SUCCESS');
        console.log('[DEBUG] Extracted text length:', result.extractedText?.length || 0);
        console.log('[DEBUG] First 80 chars:', result.extractedText?.slice(0, 80) || '(empty)');
        setParsedData(result.data);
        setParseError(null);
      } else {
        console.log('[DEBUG] Parse FAILED:', result.error);
        setParseError(result.error || '檔案解析失敗');
        setParsedData(null);
      }
    } catch (error) {
      console.error('[DEBUG] File processing exception:', error);
      console.error('[DEBUG] Exception stack:', error instanceof Error ? error.stack : String(error));
      setParseError('檔案處理時發生錯誤，請重試');
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSample = () => {
    onUploadComplete(null);
  };

  const handleContinue = async () => {
    if (pastedText && !parsedData) {
      // Parse pasted text before continuing
      setIsProcessing(true);
      setParseError(null);
      
      try {
        const result: ParseResult = await parseTextContent(pastedText);
        
        if (result.success && result.data) {
          setParsedData(result.data);
          onUploadComplete('貼上的文字內容', result.data);
        } else {
          setParseError(result.error || '文字解析失敗');
        }
      } catch (error) {
        console.error('Text processing error:', error);
        setParseError('文字處理時發生錯誤，請重試');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // File already parsed or data available
      onUploadComplete(uploadedFile || '貼上的文字內容', parsedData || undefined);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          開始製作你的提案簡報
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          上傳你的比稿資料，或直接貼上文字內容，讓我們幫你整理成專業的簡報格式
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 transition-all duration-200
            ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-gray-50'}
            ${uploadedFile ? 'border-green-500 bg-green-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.md,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center space-y-4">
            {uploadedFile ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">檔案已載入</p>
                  <p className="text-sm text-green-700 mt-1 break-all">{uploadedFile}</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setParsedData(null);
                    setParseError(null);
                    currentFileRef.current = null;
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-green-700 hover:text-green-900 underline"
                >
                  重新選擇檔案
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">拖放檔案到此處</p>
                  <p className="text-sm text-gray-600 mt-1">或點擊選擇檔案</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  選擇檔案
                </button>
                <p className="text-xs text-gray-500">支援 PDF、Markdown、TXT 文字檔案</p>
              </>
            )}
          </div>
        </div>

        {/* Paste Text Area */}
        <div className="border-2 border-gray-300 rounded-xl p-8 bg-white hover:border-purple-400 transition-colors">
          <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">直接貼上文字</p>
                <p className="text-sm text-gray-600">複製提案內容到下方</p>
              </div>
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="在這裡貼上你的比稿資料、專案簡介、產品說明或任何想要整理的內容..."
              className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              rows={8}
            />
            {pastedText && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                已輸入 {pastedText.length} 個字元
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <p className="text-blue-900 font-medium">正在解析檔案內容，請稍候...</p>
        </div>
      )}

      {parseError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-medium">解析遇到問題</p>
            <p className="text-sm text-red-700 mt-1">{parseError}</p>
            <p className="text-xs text-red-600 mt-2">你可以重新上傳檔案，或改用範例資料體驗功能。</p>
          </div>
        </div>
      )}

      {parsedData && !isProcessing && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <FileCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-900 font-medium">檔案已成功解析</p>
            <p className="text-sm text-green-700 mt-1">
              已從檔案擷取重點內容，包含標題、摘要與關鍵數據。格式可能不完整，你可以在後續步驟調整篩選項目。
            </p>
          </div>
        </div>
      )}

      {/* Continue or Sample Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {(uploadedFile || pastedText) ? (
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? '處理中...' : '繼續選擇模板'}
          </button>
        ) : (
          <button
            onClick={handleUseSample}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            使用範例資料體驗
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900 text-sm">多種格式</p>
              <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                支援上傳 PDF 文件、Markdown 筆記或純文字檔案
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Image className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 text-sm">視覺素材</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                可以上傳相關圖片、設計稿或情緒板作為視覺參考
              </p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 text-sm">快速開始</p>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                沒有資料也沒關係，可以先用範例資料體驗完整流程
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
