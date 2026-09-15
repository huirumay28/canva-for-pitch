'use client';

import { useState } from 'react';
import { Template, TemplateId } from '@/types/pitch';
import { Layout, BarChart2, FileText, Layers, BookOpen, Search } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

const templates: Template[] = [
  {
    id: 'visual-collage',
    name: '視覺拼貼提案',
    description: '以圖片和視覺元素為主的呈現方式，適合強調品牌形象、創意概念與視覺設計的提案',
    thumbnail: '🎨',
    categories: ['創意', '視覺設計', '品牌'],
    defaultView: 'collage',
    defaultInfoBlocks: ['brief', 'product', 'visuals', 'insights', 'summary'],
  },
  {
    id: 'data-metrics',
    name: '數據圖表簡報',
    description: '數據與指標導向的簡報格式，清楚呈現關鍵績效指標、市場趨勢與量化分析結果',
    thumbnail: '📊',
    categories: ['數據分析', '策略', '績效'],
    defaultView: 'data',
    defaultInfoBlocks: ['brief', 'metrics', 'insights', 'deliverables', 'summary'],
  },
  {
    id: 'executive-summary',
    name: '執行摘要一頁紙',
    description: '濃縮版的專案摘要格式，快速傳達核心訊息、執行策略與預期成果，適合決策者閱讀',
    thumbnail: '📝',
    categories: ['商務', '摘要', '決策'],
    defaultView: 'summary',
    defaultInfoBlocks: ['brief', 'summary', 'deliverables', 'constraints'],
  },
  {
    id: 'full-deck',
    name: '完整提案卷軸',
    description: '包含所有內容區塊的完整提案格式，涵蓋背景、策略、執行與成果等各個面向',
    thumbnail: '📑',
    categories: ['完整', '全面', '詳細'],
    defaultView: 'collage',
    defaultInfoBlocks: ['brief', 'product', 'client', 'insights', 'deliverables', 'constraints', 'metrics', 'visuals', 'summary'],
  },
  {
    id: 'story-narrative',
    name: '故事敘事版',
    description: '以故事線為主軸的呈現方式，串連產品、市場與解決方案，打造有溫度的提案敘述',
    thumbnail: '📖',
    categories: ['故事', '敘事', '溝通'],
    defaultView: 'collage',
    defaultInfoBlocks: ['brief', 'product', 'client', 'insights', 'visuals', 'summary'],
  },
];

const allCategories = Array.from(
  new Set(templates.flatMap(t => t.categories))
);

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !selectedCategory || template.categories.includes(selectedCategory);
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900">
          選擇適合的簡報模板
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          根據你的提案重點，選擇最適合的呈現格式
        </p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋模板..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${!selectedCategory 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
              }
            `}
          >
            全部
          </button>
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${selectedCategory === category
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="group bg-white rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-200 overflow-hidden text-left"
          >
            <div className="aspect-video bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
              <span className="text-6xl group-hover:scale-110 transition-transform duration-200">
                {template.thumbnail}
              </span>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {template.categories.map(category => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">沒有找到符合的模板，試試其他關鍵字或類別</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Layout className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">選擇模板後可以自訂內容</p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
              每個模板都有預設的資訊呈現方式，但你可以在下一步自由選擇要包含或排除哪些內容區塊，並且隨時切換不同的視圖模式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
