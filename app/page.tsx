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
                <span className="text-sm font-medium text-purple-900">Role-Based Pitch Optimization</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Optimize Pitch Orientation for{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Every Role
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Same content, different formats. Creatives see visuals, strategists see data, 
                business sees summaries. Everyone gets exactly what they need.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creative</h3>
                  <p className="text-gray-600 text-sm">Visual collages, mood boards, and content layouts that inspire creative thinking.</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategy</h3>
                  <p className="text-gray-600 text-sm">Data visualizations, metrics, and trend analysis for strategic decisions.</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Business</h3>
                  <p className="text-gray-600 text-sm">Executive summaries with key objectives, deliverables, and outcomes.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                <button
                  onClick={handleStartDemo}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  Try Demo with Sample Pitch
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your Materials
                </button>
              </div>

              <div className="mt-16 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">1</div>
                    <p className="text-gray-700">Select your role</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">2</div>
                    <p className="text-gray-700">Load pitch materials</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">3</div>
                    <p className="text-gray-700">View in your format</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-2">4</div>
                    <p className="text-gray-700">Switch views anytime</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Role</h2>
                <p className="text-gray-600">
                  Select your primary role to see a customized view. You can switch between views anytime.
                </p>
              </div>
              
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={handleRoleSelect}
              />

              <div className="mt-8 text-center">
                <button
                  onClick={handleReset}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  ← Back to landing
                </button>
              </div>
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
                {selectedRole && `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} View`}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Viewing pitch materials optimized for your role. Switch views to see the same content in different formats.
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
              <p className="text-sm text-blue-900 font-medium">Demo Mode: Sample Pitch Loaded</p>
              <p className="text-xs text-blue-700 mt-1">
                This demo uses a sample sustainable fashion campaign. Upload your own materials to see your pitch content in action.
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
