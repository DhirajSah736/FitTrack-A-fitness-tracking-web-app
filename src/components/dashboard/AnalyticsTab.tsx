import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Target, 
  Activity, 
  Zap,
  Award,
  RefreshCw
} from 'lucide-react';
import { workoutService, mealService, goalService, analyticsService } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressChart from '../charts/ProgressChart';
import DetailModal from '../charts/DetailModal';
import toast from 'react-hot-toast';

interface AnalyticsData {
  workoutStats: any;
  nutritionStats: any;
  goalStats: any;
  weeklyProgress: any[];
  monthlyComparison: any;
}

interface DataPoint {
  week: string;
  metric: string;
  value: number;
  color: string;
}

const AnalyticsTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      
      const [workoutStats, nutritionStats, goals] = await Promise.all([
        analyticsService.getWorkoutStats(user.id, days),
        analyticsService.getNutritionStats(user.id, days),
        goalService.getAll(user.id)
      ]);

      // Calculate goal stats
      const goalStats = {
        total: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        inProgress: goals.filter(g => g.status === 'in_progress').length,
        failed: goals.filter(g => g.status === 'failed').length
      };

      // Generate weekly progress data for chart
      const weeklyProgress = Array.from({ length: 8 }, (_, i) => {
        const weekOffset = 7 - i;
        const date = new Date();
        date.setDate(date.getDate() - (weekOffset * 7));
        
        return {
          week: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          workouts: Math.floor(Math.random() * 25) + 75, // 75-100%
          nutrition: Math.floor(Math.random() * 20) + 80, // 80-100%
          goals: Math.floor(Math.random() * 30) + 70 // 70-100%
        };
      });

      // Monthly comparison (mock data)
      const monthlyComparison = {
        currentMonth: {
          workouts: workoutStats.totalWorkouts,
          avgCalories: nutritionStats.averageCaloriesPerDay,
          goalsCompleted: goalStats.completed
        },
        previousMonth: {
          workouts: Math.floor(workoutStats.totalWorkouts * 0.8),
          avgCalories: Math.floor(nutritionStats.averageCaloriesPerDay * 0.9),
          goalsCompleted: Math.max(goalStats.completed - 1, 0)
        }
      };

      setAnalyticsData({
        workoutStats,
        nutritionStats,
        goalStats,
        weeklyProgress,
        monthlyComparison
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analyticsData) return;

    const data = {
      exportDate: new Date().toISOString(),
      timeRange,
      workoutStats: analyticsData.workoutStats,
      nutritionStats: analyticsData.nutritionStats,
      goalStats: analyticsData.goalStats,
      weeklyProgress: analyticsData.weeklyProgress
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully!');
  };

  const handleDataPointClick = (dataPoint: DataPoint) => {
    setSelectedDataPoint(dataPoint);
    setShowDetailModal(true);
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Start logging workouts and meals to see your analytics</p>
      </div>
    );
  }

  const { workoutStats, nutritionStats, goalStats, weeklyProgress, monthlyComparison } = analyticsData;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your progress and performance trends</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex space-x-2">
            <button
              onClick={loadAnalyticsData}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={exportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          {
            title: 'Total Workouts',
            value: workoutStats.totalWorkouts,
            change: getChangePercentage(monthlyComparison.currentMonth.workouts, monthlyComparison.previousMonth.workouts),
            icon: Activity,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            title: 'Avg Daily Calories',
            value: Math.round(nutritionStats.averageCaloriesPerDay),
            change: getChangePercentage(monthlyComparison.currentMonth.avgCalories, monthlyComparison.previousMonth.avgCalories),
            icon: Zap,
            color: 'text-orange-600',
            bgColor: 'bg-orange-100'
          },
          {
            title: 'Goals Completed',
            value: goalStats.completed,
            change: getChangePercentage(monthlyComparison.currentMonth.goalsCompleted, monthlyComparison.previousMonth.goalsCompleted),
            icon: Target,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          },
          {
            title: 'Workout Frequency',
            value: workoutStats.workoutFrequency,
            change: Math.round((workoutStats.totalWorkouts / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)) * 100),
            icon: Award,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={index}
              className="bg-white p-3 sm:p-6 rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${getChangeColor(stat.change)}`}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
              </div>
              
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{stat.title}</p>
                <p className={`text-xs font-medium ${stat.color}`}>vs. previous period</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical Chart */}
      <ProgressChart 
        onDataPointClick={handleDataPointClick}
        className="col-span-full"
      />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Workout Performance */}
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Workout Performance</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Total Sets', value: workoutStats.totalSets, color: 'text-blue-600' },
              { label: 'Total Reps', value: workoutStats.totalReps, color: 'text-green-600' },
              { label: 'Unique Exercises', value: workoutStats.uniqueExercises, color: 'text-purple-600' },
              ...(workoutStats.averageWeight > 0 ? [{ label: 'Average Weight', value: `${workoutStats.averageWeight} lbs`, color: 'text-orange-600' }] : [])
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.label === 'Total Sets' ? 'Across all workouts' :
                     item.label === 'Total Reps' ? 'Volume completed' :
                     item.label === 'Unique Exercises' ? 'Exercise variety' :
                     'Per exercise'}
                  </p>
                </div>
                <span className={`text-lg sm:text-2xl font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Breakdown */}
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Nutrition Breakdown</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {[
              { label: 'Total Calories', value: nutritionStats.totalCalories, unit: '', color: 'text-blue-600' },
              { label: 'Total Protein', value: Math.round(nutritionStats.totalProtein), unit: 'g', color: 'text-green-600' },
              { label: 'Total Carbs', value: Math.round(nutritionStats.totalCarbs), unit: 'g', color: 'text-orange-600' },
              { label: 'Total Fats', value: Math.round(nutritionStats.totalFats), unit: 'g', color: 'text-purple-600' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm sm:text-base font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Over {timeRange}</p>
                </div>
                <span className={`text-lg sm:text-2xl font-bold ${item.color}`}>{item.value}{item.unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Goals Overview</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Goals', value: goalStats.total, icon: Target, color: 'text-blue-600', bgColor: 'bg-blue-100' },
            { label: 'Completed', value: goalStats.completed, icon: Award, color: 'text-green-600', bgColor: 'bg-green-100' },
            { label: 'In Progress', value: goalStats.inProgress, icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100' },
            { label: 'Success Rate', value: `${goalStats.total > 0 ? Math.round((goalStats.completed / goalStats.total) * 100) : 0}%`, icon: Calendar, color: 'text-gray-600', bgColor: 'bg-gray-100' }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                  <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${item.color}`} />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">{item.value}</p>
                <p className="text-xs sm:text-sm text-gray-600">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Monthly Performance Report</h2>
        
        <div className="prose max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-2">Key Highlights</h3>
            <ul className="text-blue-800 space-y-1 text-sm sm:text-base">
              <li>• Completed {workoutStats.totalWorkouts} workouts this period</li>
              <li>• Maintained an average of {Math.round(nutritionStats.averageCaloriesPerDay)} calories per day</li>
              <li>• Achieved {goalStats.completed} fitness goals</li>
              <li>• Exercised {workoutStats.uniqueExercises} different types of exercises</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-base sm:text-lg font-medium text-green-900 mb-2">Recommendations</h3>
            <ul className="text-green-800 space-y-1 text-sm sm:text-base">
              <li>• {workoutStats.workoutFrequency < 0.5 ? 'Try to increase workout frequency for better results' : 'Great job maintaining consistent workout schedule!'}</li>
              <li>• {nutritionStats.totalProtein / (timeRange === '7d' ? 7 : 30) < 100 ? 'Consider increasing protein intake for muscle recovery' : 'Excellent protein intake for muscle building!'}</li>
              <li>• {goalStats.inProgress > goalStats.completed ? 'Focus on completing current goals before setting new ones' : 'Ready to set new challenging goals!'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        dataPoint={selectedDataPoint}
      />
    </div>
  );
};

export default AnalyticsTab;