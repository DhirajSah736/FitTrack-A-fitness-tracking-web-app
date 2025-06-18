import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import 'chartjs-adapter-date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Wifi, WifiOff, RefreshCw, Pause, Play } from 'lucide-react';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface RealTimeDataPoint {
  id: string;
  timestamp: string;
  workout_count: number;
  calories_consumed: number;
  goals_progress: number;
  user_id: string;
}

interface ChartDataSeries {
  label: string;
  data: { x: string; y: number }[];
  borderColor: string;
  backgroundColor: string;
  unit: string;
  yAxisID: string;
}

interface RealTimeChartProps {
  refreshRate?: number; // in milliseconds
  maxDataPoints?: number;
  className?: string;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  refreshRate = 5000, // 5 seconds default
  maxDataPoints = 50,
  className = ''
}) => {
  const { user } = useAuth();
  const chartRef = useRef<ChartJS<'line'>>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataPoints, setDataPoints] = useState<RealTimeDataPoint[]>([]);
  
  // Chart data series configuration
  const dataSeries: ChartDataSeries[] = [
    {
      label: 'Daily Workouts',
      data: [],
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      unit: 'workouts',
      yAxisID: 'y'
    },
    {
      label: 'Calories Consumed',
      data: [],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      unit: 'kcal',
      yAxisID: 'y1'
    },
    {
      label: 'Goals Progress',
      data: [],
      borderColor: '#FFC107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      unit: '%',
      yAxisID: 'y2'
    }
  ];

  // Fetch real-time data from database
  const fetchRealTimeData = useCallback(async () => {
    if (!user || isPaused) return;

    try {
      setError(null);
      
      // Get current date for today's data
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Fetch workout count for today
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());

      if (workoutError) throw workoutError;

      // Fetch calories consumed today
      const { data: meals, error: mealError } = await supabase
        .from('meals')
        .select('calories, consumed_at')
        .eq('user_id', user.id)
        .gte('consumed_at', startOfDay.toISOString());

      if (mealError) throw mealError;

      // Fetch goals progress
      const { data: goals, error: goalError } = await supabase
        .from('goals')
        .select('current_value, target_value, status')
        .eq('user_id', user.id)
        .eq('status', 'in_progress');

      if (goalError) throw goalError;

      // Calculate metrics
      const workoutCount = workouts?.length || 0;
      const totalCalories = meals?.reduce((sum, meal) => sum + meal.calories, 0) || 0;
      const goalsProgress = goals?.length > 0 
        ? Math.round((goals.reduce((sum, goal) => sum + (goal.current_value / goal.target_value), 0) / goals.length) * 100)
        : 0;

      // Create new data point
      const newDataPoint: RealTimeDataPoint = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        workout_count: workoutCount,
        calories_consumed: totalCalories,
        goals_progress: goalsProgress,
        user_id: user.id
      };

      // Update data points
      setDataPoints(prev => {
        const updated = [...prev, newDataPoint];
        // Keep only the latest maxDataPoints
        return updated.slice(-maxDataPoints);
      });

      setLastUpdate(new Date());
      setIsConnected(true);
      
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setIsConnected(false);
      toast.error('Connection lost. Retrying...');
    }
  }, [user, isPaused, maxDataPoints]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    // Initial data fetch
    fetchRealTimeData();
    setIsLoading(false);

    // Set up interval for continuous updates
    if (!isPaused) {
      intervalRef.current = setInterval(fetchRealTimeData, refreshRate);
    }

    // Set up Supabase real-time subscription for immediate updates
    const subscription = supabase
      .channel('fitness_data_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'workouts', filter: `user_id=eq.${user.id}` },
        () => fetchRealTimeData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'meals', filter: `user_id=eq.${user.id}` },
        () => fetchRealTimeData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` },
        () => fetchRealTimeData()
      )
      .subscribe();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription.unsubscribe();
    };
  }, [user, refreshRate, isPaused, fetchRealTimeData]);

  // Prepare chart data
  const chartData = {
    datasets: dataSeries.map(series => {
      const seriesData = dataPoints.map(point => ({
        x: point.timestamp,
        y: series.label === 'Daily Workouts' ? point.workout_count :
           series.label === 'Calories Consumed' ? point.calories_consumed :
           point.goals_progress
      }));

      return {
        label: series.label,
        data: seriesData,
        borderColor: series.borderColor,
        backgroundColor: series.backgroundColor,
        borderWidth: 2,
        pointBackgroundColor: series.borderColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false,
        yAxisID: series.yAxisID
      };
    })
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Real-Time Fitness Metrics',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#1f2937'
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          title: (context: TooltipItem<'line'>[]) => {
            const timestamp = new Date(context[0].parsed.x);
            return format(timestamp, 'MMM dd, yyyy HH:mm:ss');
          },
          label: (context: TooltipItem<'line'>) => {
            const series = dataSeries[context.datasetIndex];
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value} ${series.unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#6b7280'
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Workouts',
          color: '#4CAF50',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(76, 175, 80, 0.1)'
        },
        ticks: {
          color: '#4CAF50'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Calories (kcal)',
          color: '#2196F3',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#2196F3'
        }
      },
      y2: {
        type: 'linear',
        display: false,
        min: 0,
        max: 100
      }
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      toast.success('Real-time updates resumed');
    } else {
      toast.success('Real-time updates paused');
    }
  };

  const manualRefresh = () => {
    fetchRealTimeData();
    toast.success('Data refreshed manually');
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Connecting to real-time data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Real-Time Metrics</h2>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePause}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isPaused 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={manualRefresh}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            title="Manual refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">
            Refresh Rate: <span className="font-medium">{refreshRate / 1000}s</span>
          </span>
          <span className="text-gray-600">
            Data Points: <span className="font-medium">{dataPoints.length}/{maxDataPoints}</span>
          </span>
          {lastUpdate && (
            <span className="text-gray-600">
              Last Update: <span className="font-medium">{format(lastUpdate, 'HH:mm:ss')}</span>
            </span>
          )}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm font-medium">
            Error: {error}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative h-80 w-full">
        {dataPoints.length > 0 ? (
          <Line
            ref={chartRef}
            data={chartData}
            options={options}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Waiting for data...</p>
              <p className="text-sm text-gray-500">Start logging workouts and meals to see real-time updates</p>
            </div>
          </div>
        )}
      </div>

      {/* Current Values Display */}
      {dataPoints.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          {dataSeries.map((series, index) => {
            const latestValue = dataPoints[dataPoints.length - 1];
            const value = series.label === 'Daily Workouts' ? latestValue.workout_count :
                         series.label === 'Calories Consumed' ? latestValue.calories_consumed :
                         latestValue.goals_progress;
            
            return (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div 
                  className="text-2xl font-bold mb-1"
                  style={{ color: series.borderColor }}
                >
                  {value}{series.unit}
                </div>
                <div className="text-sm text-gray-600">{series.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Gap Handling */}
      {!isConnected && dataPoints.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Connection lost. Displaying last known data. Attempting to reconnect...
          </p>
        </div>
      )}
    </div>
  );
};

export default RealTimeChart;