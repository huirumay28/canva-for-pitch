'use client';

import { useState } from 'react';
import { ViewType, Template, InfoBlockType } from '@/types/pitch';
import { samplePitch } from '@/data/samplePitch';
import { Header } from '@/components/Header';
import { UploadStep } from '@/components/UploadStep';
import { TemplateGallery } from '@/components/TemplateGallery';
import { InfoFilter } from '@/components/InfoFilter';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { CollageView } from '@/components/CollageView';
import { DataView } from '@/components/DataView';
import { SummaryView } from '@/components/SummaryView';
import { FileText } from 'lucide-react';

type AppState = 'upload' | 'template-selection' | 'info-filter' | 'viewing';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedInfoBlocks, setSelectedInfoBlocks] = useState<InfoBlockType[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('collage');
  const [pitch] = useState(samplePitch);

  const handleUploadComplete = (fileName: string | null) => {
    setUploadedFileName(fileName);
    setAppState('template-selection');
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentView(template.defaultView);
    setAppState('info-filter');
  };

  const handleInfoFilterContinue = (blocks: InfoBlockType[]) => {
    setSelectedInfoBlocks(blocks);
    setAppState('viewing');
  };

  const handleReset = () => {
    setAppState('upload');
    setUploadedFileName(null);
    setSelectedTemplate(null);
    setSelectedInfoBlocks([]);
    setCurrentView('collage');
  };

  if (appState === 'upload') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="container mx-auto px-4 py-16">
            <UploadStep onUploadComplete={handleUploadComplete} />
          </div>
        </main>
      </>
    );
  }

  if (appState === 'template-selection') {
    return (
      <>
        <Header onReset={handleReset} />
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="container mx-auto px-4 py-16">
            <TemplateGallery onSelectTemplate={handleTemplateSelect} />
            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                ← 重新上傳資料
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (appState === 'info-filter') {
    return (
      <>
        <Header onReset={handleReset} />
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="container mx-auto px-4 py-16">
            <InfoFilter
              defaultBlocks={selectedTemplate?.defaultInfoBlocks || []}
              onContinue={handleInfoFilterContinue}
            />
            <div className="mt-8 text-center">
              <button
                onClick={() => setAppState('template-selection')}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                ← 重新選擇模板
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header onReset={handleReset} />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTemplate?.name || '你的簡報'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                已套用「{selectedTemplate?.name}」模板，隨時可以切換到其他視圖查看相同內容
              </p>
            </div>
            <ViewSwitcher
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-900 font-medium">
                {uploadedFileName ? `已載入：${uploadedFileName}` : '目前使用範例資料'}
              </p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                {uploadedFileName 
                  ? '這是你上傳的提案資料。你可以隨時切換視圖或調整內容呈現方式。'
                  : '這是一份環保時尚品牌的數位行銷提案範例。未來你可以上傳自己的比稿資料，用相同的方式快速整理與呈現。'
                }
              </p>
            </div>
          </div>

          <div className="animate-fadeIn">
            {currentView === 'collage' && <CollageView pitch={pitch} />}
            {currentView === 'data' && <DataView pitch={pitch} />}
            {currentView === 'summary' && <SummaryView pitch={pitch} />}
          </div>
        </div>
      </main>
    </>
  );
}
