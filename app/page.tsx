'use client';

import { useState } from 'react';
import { Role, ViewType } from '@/types/pitch';
import { samplePitch } from '@/data/samplePitch';
import { Header } from '@/components/Header';
import { RoleSelector } from '@/components/RoleSelector';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { CollageView } from '@/components/CollageView';
import { DataView } from '@/components/DataView';
import { SummaryView } from '@/components/SummaryView';
import { ArrowRight, Upload, FileText, Sparkles } from 'lucide-react';

type AppState = 'landing' | 'role-selection' | 'viewing';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('collage');
  const [pitch] = useState(samplePitch);

  const handleStartDemo = () => {
    setAppState('role-selection');
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    const defaultViews: Record<Role, ViewType> = {
      creative: 'collage',
      strategy: 'data',
      business: 'summary',
    };
    setCurrentView(defaultViews[role]);
    setAppState('viewing');
  };

  const handleReset = () => {
    setAppState('landing');
    setSelectedRole(null);
    setCurrentView('collage');
  };

  if (appState === 'landing') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">依角色優化資訊呈現</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                讓不同角色用
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  最有效的方式
                </span>
                <br />看到對的資訊
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                同一份比稿資料，自動切換成最適合的呈現格式。
                創意看視覺拼貼，策略看數據圖表，業務看重點摘要，
                讓每個人都能快速掌握需要的資訊。
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">創意角色</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    以視覺拼貼呈現內容與靈感，包含情緒板、產品視覺與創意發想素材，激發創意思考。
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">策略角色</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    專注於數據圖表、關鍵指標與市場趨勢分析，提供策略思考所需的量化資訊與洞察。
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">商務角色</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    清楚呈現專案目標、執行策略與預期成果，快速掌握關鍵交付項目與專案範圍。
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <button
                  onClick={handleStartDemo}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  用範例資料試試看
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex items-center gap-2 opacity-75 cursor-not-allowed">
                  <Upload className="w-5 h-5" />
                  上傳自己的資料
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">即將推出</span>
                </button>
              </div>

              <div className="mt-16 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">使用方式很簡單</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">1</div>
                    <p className="text-gray-700">選擇你的角色</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">2</div>
                    <p className="text-gray-700">載入比稿資料</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">3</div>
                    <p className="text-gray-700">看到最適合的呈現</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">4</div>
                    <p className="text-gray-700">隨時一鍵切換視圖</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (appState === 'role-selection') {
    return (
      <>
        <Header onReset={handleReset} />
        <main className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">選擇你的角色</h2>
                <p className="text-gray-600 leading-relaxed">
                  選擇你的主要角色，系統會自動顯示最適合的資訊呈現方式。
                  <br />
                  之後隨時都可以一鍵切換到其他視圖。
                </p>
              </div>
              
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={handleRoleSelect}
              />

              <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 text-center">
                  💡 小提示：每個角色會預設顯示不同的視圖，但你可以隨時切換到拼貼、數據或摘要視圖。
                </p>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  ← 回到首頁
                </button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const roleLabels: Record<Role, string> = {
    creative: '創意',
    strategy: '策略',
    business: '商務',
  };

  return (
    <>
      <Header onReset={handleReset} />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedRole && `${roleLabels[selectedRole]}視角`}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                已針對你的角色優化資訊呈現方式，隨時可以切換到其他視圖查看相同內容。
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
              <p className="text-sm text-blue-900 font-medium">目前使用範例資料</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                這是一份環保時尚品牌的數位行銷提案範例。未來你可以上傳自己的比稿資料，用相同的方式快速整理與呈現。
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
