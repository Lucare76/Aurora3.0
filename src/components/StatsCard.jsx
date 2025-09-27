import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: {
        icon: 'text-blue-600 bg-blue-100',
        trend: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        icon: 'text-green-600 bg-green-100',
        trend: 'text-green-600',
        border: 'border-green-200'
      },
      red: {
        icon: 'text-red-600 bg-red-100',
        trend: 'text-red-600',
        border: 'border-red-200'
      },
      purple: {
        icon: 'text-purple-600 bg-purple-100',
        trend: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        icon: 'text-orange-600 bg-orange-100',
        trend: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses();

  return (
    <div className={`bg-white p-6 rounded-lg border ${colorClasses.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className={`p-2 rounded-lg ${colorClasses.icon}`}>
              {icon}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trendValue && (
              <div className={`flex items-center text-sm ${colorClasses.trend}`}>
                {getTrendIcon()}
                <span className="ml-1">{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;