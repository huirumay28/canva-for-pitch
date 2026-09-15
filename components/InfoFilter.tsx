'use client';

import { useState } from 'react';
import { InfoBlockType } from '@/types/pitch';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';

interface InfoFilterProps {
  defaultBlocks: InfoBlockType[];
  onContinue: (selectedBlocks: InfoBlockType[]) => void;
}

const blockLabels: Record<InfoBlockType, { label: string; description: string; icon: string }> = {
  brief: {
    label: '專案簡介',
    description: '提案的核心目標與背景脈絡',
    icon: '📋',
  },
  product: {
    label: '產品資料',
    description: '產品或服務的詳細說明',
    icon: '📦',
  },
  client: {
    label: '客戶背景',
    description: '客戶公司與產業相關資訊',
    icon: '🏢',
  },
  insights: {
    label: '市場洞察',
    description: '趨勢分析、機會點與挑戰',
    icon: '💡',
  },
  deliverables: {
    label: '交付項目',
    description: '具體的執行內容與產出物',
    icon: '✅',
  },
  constraints: {
    label: '限制條件',
    description: '預算、時程與其他條件限制',
    icon: '⚠️',
  },
  metrics: {
    label: 'KPI 指標',
    description: '關鍵績效指標與目標數據',
    icon: '📊',
  },
  visuals: {
    label: '視覺素材',
    description: '相關圖片、設計稿與靈感圖',
    icon: '🎨',
  },
  summary: {
    label: '執行摘要',
    description: '目標、方法與預期成果總結',
    icon: '📝',
  },
};

const allBlocks: InfoBlockType[] = [
  'brief',
  'product',
  'client',
  'insights',
  'deliverables',
  'constraints',
  'metrics',
  'visuals',
  'summary',
];

export function InfoFilter({ defaultBlocks, onContinue }: InfoFilterProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<InfoBlockType[]>(defaultBlocks);

  const toggleBlock = (block: InfoBlockType) => {
    setSelectedBlocks(prev =>
      prev.includes(block)
        ? prev.filter(b => b !== block)
        : [...prev, block]
    );
  };

  const selectAll = () => {
    setSelectedBlocks(allBlocks);
  };

  const useRecommended = () => {
    setSelectedBlocks(defaultBlocks);
  };

  const handleContinue = () => {
    if (selectedBlocks.length > 0) {
      onContinue(selectedBlocks);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          選擇要呈現的資訊
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          根據需求勾選想要包含的內容區塊，系統會依據你的選擇調整簡報內容
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={useRecommended}
          className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          使用建議選項
        </button>
        <button
          onClick={selectAll}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          全選
        </button>
        <button
          onClick={() => setSelectedBlocks([])}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          全部清除
        </button>
      </div>

      {/* Info Blocks Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {allBlocks.map(block => {
          const config = blockLabels[block];
          const isSelected = selectedBlocks.includes(block);
          const isRecommended = defaultBlocks.includes(block);

          return (
            <button
              key={block}
              onClick={() => toggleBlock(block)}
              className={`
                relative p-5 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                      {config.label}
                    </h3>
                    {isRecommended && !isSelected && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        建議
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                    {config.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Count */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          已選擇 <span className="font-bold text-purple-600">{selectedBlocks.length}</span> 個內容區塊
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={selectedBlocks.length === 0}
          className={`
            px-10 py-4 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200
            ${selectedBlocks.length > 0
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          開始製作簡報
        </button>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <p className="text-sm text-blue-900 text-center leading-relaxed">
          💡 進入簡報後，你隨時可以切換不同的視圖模式（視覺拼貼、數據圖表、摘要），查看相同內容的不同呈現方式
        </p>
      </div>
    </div>
  );
}
