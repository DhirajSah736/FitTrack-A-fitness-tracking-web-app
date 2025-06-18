import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  Save,
  Share2,
  Camera,
  Trophy
} from 'lucide-react';
import { goalService, GoalInput, Goal } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const GoalsTab: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed' | 'failed'>('all');
  
  const [formData, setFormData] = useState<GoalInput>({
    type: 'weight',
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const goalTypes = [
    { value: 'weight', label: 'Weight Loss/Gain', icon: TrendingUp, color: 'blue' },
    { value: 'strength', label: 'Strength', icon: Trophy, color: 'green' },
    { value: 'consistency', label: 'Consistency', icon: Calendar, color: 'purple' }
  ];

  const goalTemplates = [
    {
      type: 'weight' as const,
      title: 'Lose 10 pounds',
      description: 'Healthy weight loss goal',
      target_value: 10,
      duration_weeks: 12
    },
    {
      type: 'strength' as const,
      title: 'Bench Press 200 lbs',
      description: 'Increase bench press strength',
      target_value: 200,
      duration_weeks: 16
    },
    {
      type: 'consistency' as const,
      title: 'Workout 4 times per week',
      description: 'Build a consistent workout habit',
      target_value: 4,
      duration_weeks: 8
    }
  ];

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await goalService.getAll(user.id);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingGoal) {
        await goalService.update(editingGoal.id, formData);
        toast.success('Goal updated successfully!');
      } else {
        await goalService.create(user.id, formData);
        toast.success('Goal created successfully!');
      }
      
      resetForm();
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalService.delete(id);
      toast.success('Goal deleted successfully!');
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      await goalService.updateProgress(goalId, newValue);
      toast.success('Progress updated!');
      loadGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const markAsCompleted = async (goalId: string) => {
    try {
      await goalService.update(goalId, { status: 'completed' });
      toast.success('🎉 Goal completed! Congratulations!');
      loadGoals();
    } catch (error) {
      console.error('Error marking goal as completed:', error);
      toast.error('Failed to update goal status');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'weight',
      title: '',
      description: '',
      target_value: 0,
      current_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const startEdit = (goal: Goal) => {
    setFormData({
      type: goal.type,
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value,
      current_value: goal.current_value,
      start_date: goal.start_date,
      end_date: goal.end_date
    });
    setEditingGoal(goal);
    setShowAddForm(true);
  };

  const useTemplate = (template: typeof goalTemplates[0]) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (template.duration_weeks * 7));
    
    setFormData({
      type: template.type,
      title: template.title,
      description: template.description,
      target_value: template.target_value,
      current_value: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
    setShowAddForm(true);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const filteredGoals = goals.filter(goal => 
    filterStatus === 'all' || goal.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600">Set targets and track your fitness journey</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Templates */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goalTemplates.map((template, index) => {
            const goalType = goalTypes.find(t => t.value === template.type);
            const Icon = goalType?.icon || Target;
            
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                onClick={() => useTemplate(template)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 bg-${goalType?.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 text-${goalType?.color}-600`} />
                  </div>
                  <h3 className="font-medium text-gray-900">{template.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <p className="text-xs text-gray-500">{template.duration_weeks} weeks</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { value: 'all', label: 'All Goals' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'failed', label: 'Failed' }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              filterStatus === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
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
                    Goal Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {goalTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lose 10 pounds"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe your goal and motivation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Value
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={formData.target_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_value: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Value
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.current_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                    <span>{editingGoal ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => {
            const goalType = goalTypes.find(t => t.value === goal.type);
            const Icon = goalType?.icon || Target;
            const StatusIcon = getStatusIcon(goal.status);
            const progress = getProgressPercentage(goal.current_value, goal.target_value);
            const daysRemaining = getDaysRemaining(goal.end_date);
            
            return (
              <div key={goal.id} className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-${goalType?.color}-100 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${goalType?.color}-600`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {goal.description && (
                        <p className="text-gray-600 mb-2">{goal.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Target: {goal.target_value}</span>
                        <span>Current: {goal.current_value}</span>
                        {daysRemaining > 0 ? (
                          <span>{daysRemaining} days remaining</span>
                        ) : (
                          <span className="text-red-600">Overdue</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status === 'in_progress' && progress >= 100 && (
                      <button
                        onClick={() => markAsCompleted(goal.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Mark as completed"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      title="Share goal"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => startEdit(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${goalType?.color}-600 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Update Progress */}
                {goal.status === 'in_progress' && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Update progress"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseFloat((e.target as HTMLInputElement).value);
                          if (!isNaN(value)) {
                            updateProgress(goal.id, value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <button
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm"
                      title="Add progress photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-12 text-center transition-all duration-300 hover:shadow-lg">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-6">Set your first fitness goal to start tracking progress</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsTab;