'use client';

import { PitchData } from '@/types/pitch';
import { Target, Lightbulb, TrendingUp } from 'lucide-react';

interface SummaryViewProps {
  pitch: PitchData;
}

export function SummaryView({ pitch }: SummaryViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-8 shadow-lg text-white">
        <h2 className="text-3xl font-bold mb-3">{pitch.title}</h2>
        <p className="text-purple-100 text-lg">{pitch.brief}</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            {pitch.product.name}
          </span>
          <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
            {pitch.client.name}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Objective</h3>
          </div>
          <p className="text-gray-700">{pitch.keySummary.objective}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Approach</h3>
          </div>
          <p className="text-gray-700">{pitch.keySummary.approach}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Expected Outcome</h3>
          </div>
          <p className="text-gray-700">{pitch.keySummary.expectedOutcome}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Deliverables</h3>
          <div className="space-y-2">
            {pitch.deliverables.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                <span className="text-purple-600 font-bold text-sm mt-0.5">{idx + 1}.</span>
                <p className="text-sm text-gray-700 flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="space-y-3">
            {pitch.metrics.slice(0, 5).map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors">
                <span className="text-sm text-gray-700">{metric.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {metric.unit === '$' && '$'}
                  {metric.value.toLocaleString()}
                  {metric.unit !== '$' && <span className="text-gray-600 ml-0.5">{metric.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Budget</p>
            <p className="text-lg font-semibold text-gray-900">{pitch.constraints.budget || 'TBD'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Timeline</p>
            <p className="text-lg font-semibold text-gray-900">{pitch.constraints.timeline || 'TBD'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Requirements</p>
            <p className="text-lg font-semibold text-gray-900">{pitch.constraints.requirements.length} key constraints</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 3 Market Trends</h3>
        <div className="space-y-2">
          {pitch.insights.trends.slice(0, 3).map((trend, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-orange-600 font-bold text-sm mt-0.5">{idx + 1}.</span>
              <p className="text-gray-700">{trend}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
