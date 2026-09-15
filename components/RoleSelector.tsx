'use client';

import { Role } from '@/types/pitch';
import { Palette, BarChart3, Briefcase } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
}

const roleConfig = {
  creative: {
    icon: Palette,
    label: 'Creative',
    description: 'Content & visuals',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
  },
  strategy: {
    icon: BarChart3,
    label: 'Strategy',
    description: 'Data & trends',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
  },
  business: {
    icon: Briefcase,
    label: 'Business',
    description: 'Key summaries',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
  },
};

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.keys(roleConfig) as Role[]).map((role) => {
        const config = roleConfig[role];
        const Icon = config.icon;
        const isSelected = selectedRole === role;

        return (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className={`
              relative p-6 rounded-xl border-2 transition-all duration-200
              ${isSelected ? `${config.borderColor} shadow-lg scale-105` : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
              ${isSelected ? config.bgColor : 'bg-white'}
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`
                  w-16 h-16 rounded-full bg-gradient-to-br ${config.color} 
                  flex items-center justify-center shadow-md
                  ${isSelected ? 'scale-110' : ''}
                  transition-transform duration-200
                `}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isSelected ? config.textColor : 'text-gray-900'}`}>
                  {config.label}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              </div>
            </div>
            {isSelected && (
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
