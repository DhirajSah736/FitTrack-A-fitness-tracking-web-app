import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Calendar,
  Award,
  Heart,
  Zap,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { workoutService, mealService, goalService, analyticsService } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface QuickStats {
  workouts: number;
  calories: number;
  goals: number;
  streak: number;
}

interface RecentActivity {
  id: string;
  type: 'workout' | 'meal' | 'goal';
  title: string;
  subtitle: string;
  time: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface OverviewTabProps {
  onTabChange?: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    workouts: 0,
    calories: 0,
    goals: 0,
    streak: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load all data in parallel
      const [workouts, meals, goals, workoutAnalytics, nutritionAnalytics] = await Promise.all([
        workoutService.getAll(user.id),
        mealService.getAll(user.id),
        goalService.getAll(user.id),
        analyticsService.getWorkoutStats(user.id, 30),
        analyticsService.getNutritionStats(user.id, 7)
      ]);

      // Calculate quick stats
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const todayWorkouts = workouts.filter(w => 
        new Date(w.created_at) >= todayStart
      ).length;

      const todayCalories = meals
        .filter(m => new Date(m.consumed_at) >= todayStart)
        .reduce((sum, m) => sum + m.calories, 0);

      const activeGoals = goals.filter(g => g.status === 'in_progress').length;

      // Calculate workout streak (simplified)
      const workoutStreak = calculateWorkoutStreak(workouts);

      setQuickStats({
        workouts: todayWorkouts,
        calories: todayCalories,
        goals: activeGoals,
        streak: workoutStreak
      });

      // Prepare recent activities
      const activities: RecentActivity[] = [];

      // Add recent workouts
      workouts.slice(0, 3).forEach(workout => {
        activities.push({
          id: workout.id,
          type: 'workout',
          title: workout.exercise_name,
          subtitle: `${workout.sets} sets × ${workout.reps} reps`,
          time: formatTimeAgo(workout.created_at),
          icon: Activity,
          color: 'text-blue-600'
        });
      });

      // Add recent meals
      meals.slice(0, 2).forEach(meal => {
        activities.push({
          id: meal.id,
          type: 'meal',
          title: meal.food_name,
          subtitle: `${meal.calories} calories`,
          time: formatTimeAgo(meal.consumed_at),
          icon: Zap,
          color: 'text-green-600'
        });
      });

      // Sort by time and take top 5
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivities(activities.slice(0, 5));

      setWorkoutStats(workoutAnalytics);
      setNutritionStats(nutritionAnalytics);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkoutStreak = (workouts: any[]): number => {
    if (workouts.length === 0) return 0;

    const workoutDates = workouts
      .map(w => new Date(w.created_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < workoutDates.length; i++) {
      const workoutDate = currentDate.toDateString();
      
      if (workoutDates.includes(workoutDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleQuickAction = (action: string) => {
    if (onTabChange) {
      onTabChange(action);
      toast.success(`Navigating to ${action.charAt(0).toUpperCase() + action.slice(1)}...`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Today\'s Workouts',
      value: quickStats.workouts,
      change: workoutStats?.workoutFrequency ? `${workoutStats.workoutFrequency}/day avg` : '',
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Calories Today',
      value: quickStats.calories,
      change: nutritionStats?.averageCaloriesPerDay ? `${Math.round(nutritionStats.averageCaloriesPerDay)} avg` : '',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'up'
    },
    {
      title: 'Active Goals',
      value: quickStats.goals,
      change: 'In progress',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'neutral'
    },
    {
      title: 'Workout Streak',
      value: quickStats.streak,
      change: quickStats.streak > 0 ? 'Keep it up!' : 'Start today!',
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: quickStats.streak > 0 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.first_name || 'Champion'}! 💪
            </h1>
            <p className="text-blue-100 text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : stat.trend === 'down' ? ArrowDown : null;
          
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {TrendIcon && (
                  <TrendIcon className={`w-4 h-4 ${stat.color}`} />
                )}
              </div>
              
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <p className={`text-xs font-medium ${stat.color}`}>{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.subtitle}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recent activity</p>
              <p className="text-sm text-gray-400">Start logging workouts and meals to see your activity here</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleQuickAction('workouts')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Navigate to workouts section"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Log Workout</p>
                <p className="text-sm text-gray-600">Record your latest session</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('nutrition')}
              className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 group transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Navigate to nutrition section"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-green-600 transition-colors duration-200">Add Meal</p>
                <p className="text-sm text-gray-600">Track your nutrition</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('goals')}
              className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200 group transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Navigate to goals section"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-200">Set Goal</p>
                <p className="text-sm text-gray-600">Create a new target</p>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('analytics')}
              className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200 group transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Navigate to analytics section"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors duration-200">View Progress</p>
                <p className="text-sm text-gray-600">Check your analytics</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {(workoutStats || nutritionStats) && (
        <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workoutStats && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{workoutStats.totalWorkouts}</p>
                  <p className="text-sm text-gray-600">Workouts (30 days)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{workoutStats.uniqueExercises}</p>
                  <p className="text-sm text-gray-600">Unique Exercises</p>
                </div>
              </>
            )}
            
            {nutritionStats && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{Math.round(nutritionStats.averageCaloriesPerDay)}</p>
                  <p className="text-sm text-gray-600">Avg Calories/Day</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{nutritionStats.mealCount}</p>
                  <p className="text-sm text-gray-600">Meals Logged (7 days)</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;