import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Weight, 
  Repeat, 
  Edit3, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw,
  Camera,
  Video,
  Save,
  X
} from 'lucide-react';
import { workoutService, WorkoutInput, Workout } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  category: string;
}

const WorkoutsTab: React.FC = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Rest Timer
  const [restTimer, setRestTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState<WorkoutInput>({
    exercise_name: '',
    sets: 1,
    reps: 1,
    weight: undefined,
    duration: undefined,
    notes: ''
  });

  const workoutTemplates: WorkoutTemplate[] = [
    {
      id: '1',
      name: 'Push Day',
      category: 'Strength',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8, weight: 135 },
        { name: 'Shoulder Press', sets: 3, reps: 10, weight: 95 },
        { name: 'Tricep Dips', sets: 3, reps: 12 },
        { name: 'Push-ups', sets: 3, reps: 15 }
      ]
    },
    {
      id: '2',
      name: 'Pull Day',
      category: 'Strength',
      exercises: [
        { name: 'Pull-ups', sets: 4, reps: 8 },
        { name: 'Bent-over Row', sets: 4, reps: 10, weight: 115 },
        { name: 'Lat Pulldown', sets: 3, reps: 12, weight: 100 },
        { name: 'Bicep Curls', sets: 3, reps: 12, weight: 25 }
      ]
    },
    {
      id: '3',
      name: 'HIIT Cardio',
      category: 'Cardio',
      exercises: [
        { name: 'Burpees', sets: 4, reps: 10 },
        { name: 'Mountain Climbers', sets: 4, reps: 20 },
        { name: 'Jump Squats', sets: 4, reps: 15 },
        { name: 'High Knees', sets: 4, reps: 30 }
      ]
    }
  ];

  useEffect(() => {
    if (user) {
      loadWorkouts();
    }
  }, [user]);

  useEffect(() => {
    if (isTimerRunning && restTimer > 0) {
      const interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            toast.success('Rest time complete! 💪');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning, restTimer]);

  const loadWorkouts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await workoutService.getAll(user.id);
      setWorkouts(data);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingWorkout) {
        await workoutService.update(editingWorkout.id, formData);
        toast.success('Workout updated successfully!');
      } else {
        await workoutService.create(user.id, formData);
        toast.success('Workout logged successfully!');
      }
      
      resetForm();
      loadWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      await workoutService.delete(id);
      toast.success('Workout deleted successfully!');
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const resetForm = () => {
    setFormData({
      exercise_name: '',
      sets: 1,
      reps: 1,
      weight: undefined,
      duration: undefined,
      notes: ''
    });
    setShowAddForm(false);
    setEditingWorkout(null);
  };

  const startEdit = (workout: Workout) => {
    setFormData({
      exercise_name: workout.exercise_name,
      sets: workout.sets,
      reps: workout.reps,
      weight: workout.weight || undefined,
      duration: workout.duration || undefined,
      notes: workout.notes || ''
    });
    setEditingWorkout(workout);
    setShowAddForm(true);
  };

  const useTemplate = (template: WorkoutTemplate) => {
    // For simplicity, we'll use the first exercise from the template
    const firstExercise = template.exercises[0];
    setFormData({
      exercise_name: firstExercise.name,
      sets: firstExercise.sets,
      reps: firstExercise.reps,
      weight: firstExercise.weight,
      duration: undefined,
      notes: `From ${template.name} template`
    });
    setShowAddForm(true);
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setIsTimerRunning(true);
  };

  const stopRestTimer = () => {
    setIsTimerRunning(false);
    setRestTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.exercise_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || 
      (filterCategory === 'strength' && workout.weight) ||
      (filterCategory === 'cardio' && !workout.weight);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Workouts</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your exercises and build strength</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          {/* Rest Timer */}
          {(restTimer > 0 || isTimerRunning) && (
            <div className="flex items-center justify-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-mono text-blue-600 text-sm">{formatTime(restTimer)}</span>
              <button
                onClick={stopRestTimer}
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* Quick Rest Timer Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-600">Quick rest:</span>
        {[30, 60, 90, 120].map(seconds => (
          <button
            key={seconds}
            onClick={() => startRestTimer(seconds)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            {seconds}s
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                viewMode === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Workout Templates */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workout Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workoutTemplates.map(template => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
              onClick={() => useTemplate(template)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{template.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.category}</span>
              </div>
              <p className="text-sm text-gray-600">{template.exercises.length} exercises</p>
              <div className="mt-2 text-xs text-gray-500">
                {template.exercises.slice(0, 2).map(ex => ex.name).join(', ')}
                {template.exercises.length > 2 && '...'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Workout Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingWorkout ? 'Edit Workout' : 'Log Workout'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.exercise_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, exercise_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bench Press"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sets
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.sets}
                      onChange={(e) => setFormData(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.reps}
                      onChange={(e) => setFormData(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        weight: e.target.value ? parseFloat(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration ? parseInt(formData.duration.split(' ')[0]) : ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        duration: e.target.value ? `${e.target.value} minutes` : undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="How did it feel? Any observations?"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Add Photo</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Video className="w-4 h-4" />
                    <span>Record Form</span>
                  </button>
                </div>

                <div className="flex space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingWorkout ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Workouts List */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg">
        {filteredWorkouts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredWorkouts.map(workout => (
              <div key={workout.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {workout.exercise_name}
                      </h3>
                      {workout.weight && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm w-fit">
                          Strength
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{workout.sets} sets × {workout.reps} reps</span>
                      </div>
                      
                      {workout.weight && (
                        <div className="flex items-center space-x-1">
                          <Weight className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{workout.weight} lbs</span>
                        </div>
                      )}
                      
                      {workout.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{workout.duration}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{new Date(workout.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {workout.notes && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">{workout.notes}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => startEdit(workout)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                      title="Edit workout"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                      title="Delete workout"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Weight className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Start logging your exercises to track your progress</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Log Your First Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutsTab;