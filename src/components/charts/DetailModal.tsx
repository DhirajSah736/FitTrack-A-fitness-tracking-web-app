import React from 'react';
import { X, TrendingUp, Calendar, Target } from 'lucide-react';

interface DataPoint {
  week: string;
  metric: string;
  value: number;
  color: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoint: DataPoint | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, dataPoint }) => {
  if (!isOpen || !dataPoint) return null;

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'Workout Completion':
        return TrendingUp;
      case 'Nutrition Adherence':
        return Target;
      case 'Goal Achievement':
        return Calendar;
      default:
        return TrendingUp;
    }
  };

  const getMetricDescription = (metric: string) => {
    switch (metric) {
      case 'Workout Completion':
        return 'Percentage of planned workouts completed this week';
      case 'Nutrition Adherence':
        return 'Adherence to your nutrition plan and macro targets';
      case 'Goal Achievement':
        return 'Progress made towards your fitness goals this week';
      default:
        return 'Weekly progress metric';
    }
  };

  const getPerformanceLevel = (value: number) => {
    if (value >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (value >= 80) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (value >= 70) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const Icon = getMetricIcon(dataPoint.metric);
  const performance = getPerformanceLevel(dataPoint.value);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${dataPoint.color}20` }}
            >
              <Icon 
                className="w-5 h-5" 
                style={{ color: dataPoint.color }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{dataPoint.metric}</h2>
              <p className="text-sm text-gray-600">Week of {dataPoint.week}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Value */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={dataPoint.color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - dataPoint.value / 100)}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{dataPoint.value}%</span>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${performance.color} ${performance.bg}`}>
            {performance.level}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {getMetricDescription(dataPoint.metric)}
          </p>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Weekly Insights</h3>
          
          {dataPoint.metric === 'Workout Completion' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Workouts Planned:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Workouts Completed:</span>
                <span className="font-medium">{Math.round((dataPoint.value / 100) * 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Average Duration:</span>
                <span className="font-medium">45 min</span>
              </div>
            </div>
          )}

          {dataPoint.metric === 'Nutrition Adherence' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Meals Logged:</span>
                <span className="font-medium">{Math.round((dataPoint.value / 100) * 21)}/21</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Macro Target Hit:</span>
                <span className="font-medium">{dataPoint.value}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Calorie Goal:</span>
                <span className="font-medium">2000 kcal</span>
              </div>
            </div>
          )}

          {dataPoint.metric === 'Goal Achievement' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Goals:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Milestones Hit:</span>
                <span className="font-medium">{Math.round((dataPoint.value / 100) * 3)}/3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">On Track:</span>
                <span className="font-medium">{dataPoint.value >= 80 ? 'Yes' : 'Needs Focus'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          View Detailed Report
        </button>
      </div>
    </div>
  );
};

export default DetailModal;