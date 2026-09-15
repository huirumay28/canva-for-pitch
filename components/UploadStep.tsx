'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Image, FileCheck, AlertCircle } from 'lucide-react';
import { parseFile, parseText } from '@/utils/fileParser';
import { PitchData } from '@/types/pitch';

interface UploadStepProps {
  onUploadComplete: (fileName: string | null, pitchData?: PitchData, extractedText?: string) => void;
}

export function UploadStep({ onUploadComplete }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
      setError(null);
    }
  };

  const handleUseSample = () => {
    setError(null);
    onUploadComplete(null);
  };

  const handleContinue = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      if (uploadedFile) {
        // Parse the uploaded file
        const result = await parseFile(uploadedFile);
        
        if (!result.success) {
          setError(result.error || '解析檔案時發生未知錯誤');
          setIsProcessing(false);
          return;
        }

        // Check if the extracted text contains sample data signatures
        // This prevents silent fallback to sample data
        const text = result.extractedText?.toLowerCase() || '';
        if (text.includes('綠生活') && text.includes('180') && 
            !uploadedFile.name.toLowerCase().includes('green') &&
            !uploadedFile.name.toLowerCase().includes('綠生活')) {
          console.warn('Possible sample data contamination detected');
        }

        onUploadComplete(uploadedFile.name, result.data, result.extractedText);
      } else if (pastedText.trim()) {
        // Parse pasted text
        const blob = new Blob([pastedText], { type: 'text/plain' });
        const file = new File([blob], '貼上的文字內容.txt', { type: 'text/plain' });
        const result = await parseText(file);
        
        if (!result.success) {
          setError(result.error || '解析文字時發生未知錯誤');
          setIsProcessing(false);
          return;
        }

        onUploadComplete('貼上的文字內容', result.data, result.extractedText);
      }
    } catch (err) {
      console.error('File processing error:', err);
      setError(`處理檔案時發生錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
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

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">檔案解析失敗</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-sm text-red-700 mt-2">
                請嘗試：
                <br />• 重新選擇檔案
                <br />• 將檔案內容複製貼上到右側文字欄位
                <br />• 使用範例資料體驗功能
              </p>
            </div>
          </div>
        </div>
      )}

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
            accept=".pdf,.pptx,.md,.txt"
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
                  <p className="text-sm text-green-700 mt-1 break-all">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(uploadedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-green-700 hover:text-green-900 underline"
                  disabled={isProcessing}
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  選擇檔案
                </button>
                <p className="text-xs text-gray-500">支援 PDF、PPTX、Markdown、TXT</p>
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

      {/* Continue or Sample Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {(uploadedFile || pastedText) ? (
          <button
            onClick={handleContinue}
            disabled={isProcessing}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isProcessing ? '解析檔案中...' : '繼續選擇模板'}
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
                支援上傳 PDF 文件、PowerPoint 簡報、Markdown 筆記、純文字檔案
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
