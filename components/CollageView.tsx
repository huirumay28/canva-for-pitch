'use client';

import { PitchData } from '@/types/pitch';
import Image from 'next/image';

interface CollageViewProps {
  pitch: PitchData;
}

export function CollageView({ pitch }: CollageViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{pitch.title}</h2>
        <p className="text-gray-600 mb-4">{pitch.brief}</p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {pitch.product.category}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {pitch.client.industry}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pitch.visuals.map((visual) => (
          <div
            key={visual.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full bg-gray-100">
              <Image
                src={visual.url}
                alt={visual.caption}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 mb-1">{visual.caption}</p>
              <span className="text-xs text-gray-500">{visual.category}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">關鍵洞察</h3>
          <div className="space-y-3">
            {pitch.insights.trends.slice(0, 3).map((trend, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">●</span>
                <p className="text-sm text-gray-700">{trend}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">交付項目</h3>
          <div className="space-y-2">
            {pitch.deliverables.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">產品：{pitch.product.name}</h3>
        <p className="text-gray-700">{pitch.product.description}</p>
      </div>
    </div>
  );
}
