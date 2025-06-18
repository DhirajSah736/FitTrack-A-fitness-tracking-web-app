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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your progress and performance trends</p>
        </div>
        
        <div className="flex items-center space-x-3">
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
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm font-medium ${getChangeColor(getChangePercentage(monthlyComparison.currentMonth.workouts, monthlyComparison.previousMonth.workouts))}`}>
              {getChangePercentage(monthlyComparison.currentMonth.workouts, monthlyComparison.previousMonth.workouts) > 0 ? '+' : ''}
              {getChangePercentage(monthlyComparison.currentMonth.workouts, monthlyComparison.previousMonth.workouts)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{workoutStats.totalWorkouts}</p>
          <p className="text-sm text-gray-600">Total Workouts</p>
          <p className="text-xs text-gray-500 mt-1">vs. previous period</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-sm font-medium ${getChangeColor(getChangePercentage(monthlyComparison.currentMonth.avgCalories, monthlyComparison.previousMonth.avgCalories))}`}>
              {getChangePercentage(monthlyComparison.currentMonth.avgCalories, monthlyComparison.previousMonth.avgCalories) > 0 ? '+' : ''}
              {getChangePercentage(monthlyComparison.currentMonth.avgCalories, monthlyComparison.previousMonth.avgCalories)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{Math.round(nutritionStats.averageCaloriesPerDay)}</p>
          <p className="text-sm text-gray-600">Avg Daily Calories</p>
          <p className="text-xs text-gray-500 mt-1">vs. previous period</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-sm font-medium ${getChangeColor(getChangePercentage(monthlyComparison.currentMonth.goalsCompleted, monthlyComparison.previousMonth.goalsCompleted))}`}>
              {getChangePercentage(monthlyComparison.currentMonth.goalsCompleted, monthlyComparison.previousMonth.goalsCompleted) > 0 ? '+' : ''}
              {getChangePercentage(monthlyComparison.currentMonth.goalsCompleted, monthlyComparison.previousMonth.goalsCompleted)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{goalStats.completed}</p>
          <p className="text-sm text-gray-600">Goals Completed</p>
          <p className="text-xs text-gray-500 mt-1">vs. previous period</p>
        </div>

        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              {Math.round((workoutStats.totalWorkouts / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365)) * 100)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{workoutStats.workoutFrequency}</p>
          <p className="text-sm text-gray-600">Workout Frequency</p>
          <p className="text-xs text-gray-500 mt-1">workouts per day</p>
        </div>
      </div>

      {/* Historical Chart */}
      <ProgressChart 
        onDataPointClick={handleDataPointClick}
        className="col-span-full"
      />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Performance */}
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Workout Performance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Sets</p>
                <p className="text-sm text-gray-600">Across all workouts</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{workoutStats.totalSets}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Reps</p>
                <p className="text-sm text-gray-600">Volume completed</p>
              </div>
              <span className="text-2xl font-bold text-green-600">{workoutStats.totalReps}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Unique Exercises</p>
                <p className="text-sm text-gray-600">Exercise variety</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">{workoutStats.uniqueExercises}</span>
            </div>
            
            {workoutStats.averageWeight > 0 && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Average Weight</p>
                  <p className="text-sm text-gray-600">Per exercise</p>
                </div>
                <span className="text-2xl font-bold text-orange-600">{workoutStats.averageWeight} lbs</span>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Breakdown */}
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Nutrition Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Calories</p>
                <p className="text-sm text-gray-600">Over {timeRange}</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{nutritionStats.totalCalories}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Protein</p>
                <p className="text-sm text-gray-600">Grams consumed</p>
              </div>
              <span className="text-2xl font-bold text-green-600">{Math.round(nutritionStats.totalProtein)}g</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Carbs</p>
                <p className="text-sm text-gray-600">Grams consumed</p>
              </div>
              <span className="text-2xl font-bold text-orange-600">{Math.round(nutritionStats.totalCarbs)}g</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Fats</p>
                <p className="text-sm text-gray-600">Grams consumed</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">{Math.round(nutritionStats.totalFats)}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Overview */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Goals Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{goalStats.total}</p>
            <p className="text-sm text-gray-600">Total Goals</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{goalStats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{goalStats.inProgress}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {goalStats.total > 0 ? Math.round((goalStats.completed / goalStats.total) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Monthly Report */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Report</h2>
        
        <div className="prose max-w-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Key Highlights</h3>
            <ul className="text-blue-800 space-y-1">
              <li>• Completed {workoutStats.totalWorkouts} workouts this period</li>
              <li>• Maintained an average of {Math.round(nutritionStats.averageCaloriesPerDay)} calories per day</li>
              <li>• Achieved {goalStats.completed} fitness goals</li>
              <li>• Exercised {workoutStats.uniqueExercises} different types of exercises</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">Recommendations</h3>
            <ul className="text-green-800 space-y-1">
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