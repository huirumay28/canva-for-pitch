'use client';

import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">比稿資料平台</h1>
            <p className="text-xs text-gray-600">依角色優化資訊呈現方式</p>
          </div>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            重新開始
          </button>
        )}
        </div>
      </div>
    </header>
  );
}
