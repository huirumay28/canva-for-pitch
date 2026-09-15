'use client';

import { PitchData } from '@/types/pitch';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DataViewProps {
  pitch: PitchData;
}

export function DataView({ pitch }: DataViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{pitch.title}</h2>
        <p className="text-gray-600">{pitch.brief}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pitch.metrics.map((metric, idx) => {
          const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
          const trendColor = metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600';
          const bgColor = metric.trend === 'up' ? 'bg-green-50' : metric.trend === 'down' ? 'bg-red-50' : 'bg-gray-50';
          
          return (
            <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                {metric.trend && (
                  <div className={`${bgColor} p-1 rounded`}>
                    <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  </div>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {metric.unit === '$' && '$'}
                {metric.value.toLocaleString()}
                {metric.unit !== '$' && <span className="text-lg text-gray-600 ml-1">{metric.unit}</span>}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">市場趨勢</h3>
          <div className="space-y-3">
            {pitch.insights.trends.map((trend, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-3 py-1">
                <p className="text-sm text-gray-700">{trend}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">機會點</h3>
          <div className="space-y-3">
            {pitch.insights.opportunities.map((opp, idx) => (
              <div key={idx} className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-sm text-gray-700">{opp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">挑戰與限制</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">市場挑戰</h4>
            <div className="space-y-2">
              {pitch.insights.challenges.map((challenge, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">⚠</span>
                  <p className="text-sm text-gray-700">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">專案限制</h4>
            <div className="space-y-2">
              {pitch.constraints.budget && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">💰</span>
                  <p className="text-sm text-gray-700"><strong>預算：</strong>{pitch.constraints.budget}</p>
                </div>
              )}
              {pitch.constraints.timeline && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">⏱</span>
                  <p className="text-sm text-gray-700"><strong>時程：</strong>{pitch.constraints.timeline}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">客戶概況</h3>
        <div className="space-y-2">
          <p className="text-gray-700"><strong className="text-gray-900">{pitch.client.name}</strong> — {pitch.client.industry}</p>
          <p className="text-gray-600">{pitch.client.background}</p>
        </div>
      </div>
    </div>
  );
}
