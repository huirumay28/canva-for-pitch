'use client';

import { ViewType } from '@/types/pitch';
import { Grid3x3, BarChart2, FileText } from 'lucide-react';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewConfig = {
  collage: {
    icon: Grid3x3,
    label: '拼貼視圖',
    description: '視覺內容展示',
  },
  data: {
    icon: BarChart2,
    label: '數據圖表',
    description: '指標與趨勢',
  },
  summary: {
    icon: FileText,
    label: '重點摘要',
    description: '關鍵亮點',
  },
};

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      {(Object.keys(viewConfig) as ViewType[]).map((view) => {
        const config = viewConfig[view];
        const Icon = config.icon;
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200
              ${isActive
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
            title={config.description}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
