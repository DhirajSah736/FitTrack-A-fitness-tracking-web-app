import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  Coffee, 
  Utensils, 
  Cookie,
  Edit3,
  Trash2,
  BarChart3,
  ShoppingCart,
  Camera,
  X,
  Save
} from 'lucide-react';
import { mealService, MealInput, Meal, analyticsService } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  category: string;
}

const NutritionTab: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [nutritionStats, setNutritionStats] = useState<any>(null);
  
  const [formData, setFormData] = useState<MealInput>({
    food_name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    meal_type: 'breakfast'
  });

  const nutritionGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 67
  };

  const foodDatabase: FoodItem[] = [
    { id: '1', name: 'Chicken Breast', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fats_per_100g: 3.6, category: 'Protein' },
    { id: '2', name: 'Brown Rice', calories_per_100g: 111, protein_per_100g: 2.6, carbs_per_100g: 23, fats_per_100g: 0.9, category: 'Carbs' },
    { id: '3', name: 'Broccoli', calories_per_100g: 34, protein_per_100g: 2.8, carbs_per_100g: 7, fats_per_100g: 0.4, category: 'Vegetables' },
    { id: '4', name: 'Salmon', calories_per_100g: 208, protein_per_100g: 25, carbs_per_100g: 0, fats_per_100g: 12, category: 'Protein' },
    { id: '5', name: 'Avocado', calories_per_100g: 160, protein_per_100g: 2, carbs_per_100g: 9, fats_per_100g: 15, category: 'Fats' },
    { id: '6', name: 'Oatmeal', calories_per_100g: 389, protein_per_100g: 17, carbs_per_100g: 66, fats_per_100g: 7, category: 'Carbs' },
    { id: '7', name: 'Greek Yogurt', calories_per_100g: 59, protein_per_100g: 10, carbs_per_100g: 3.6, fats_per_100g: 0.4, category: 'Protein' },
    { id: '8', name: 'Banana', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fats_per_100g: 0.3, category: 'Fruits' }
  ];

  const mealTypeIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Apple,
    snack: Cookie
  };

  useEffect(() => {
    if (user) {
      loadMeals();
      loadNutritionStats();
    }
  }, [user, selectedDate]);

  const loadMeals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [allMeals, todayMealsData] = await Promise.all([
        mealService.getAll(user.id),
        mealService.getByDate(user.id, selectedDate)
      ]);
      
      setMeals(allMeals);
      setTodayMeals(todayMealsData);
    } catch (error) {
      console.error('Error loading meals:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const loadNutritionStats = async () => {
    if (!user) return;

    try {
      const stats = await analyticsService.getNutritionStats(user.id, 7);
      setNutritionStats(stats);
    } catch (error) {
      console.error('Error loading nutrition stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const mealData = {
        ...formData,
        consumed_at: selectedDate + 'T12:00:00Z'
      };

      if (editingMeal) {
        await mealService.update(editingMeal.id, mealData);
        toast.success('Meal updated successfully!');
      } else {
        await mealService.create(user.id, mealData);
        toast.success('Meal logged successfully!');
      }
      
      resetForm();
      loadMeals();
      loadNutritionStats();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      await mealService.delete(id);
      toast.success('Meal deleted successfully!');
      loadMeals();
      loadNutritionStats();
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error('Failed to delete meal');
    }
  };

  const resetForm = () => {
    setFormData({
      food_name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      meal_type: 'breakfast'
    });
    setShowAddForm(false);
    setEditingMeal(null);
  };

  const startEdit = (meal: Meal) => {
    setFormData({
      food_name: meal.food_name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      meal_type: meal.meal_type
    });
    setEditingMeal(meal);
    setShowAddForm(true);
  };

  const selectFoodItem = (food: FoodItem) => {
    setFormData(prev => ({
      ...prev,
      food_name: food.name,
      calories: Math.round(food.calories_per_100g),
      protein: Math.round(food.protein_per_100g * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * 10) / 10,
      fats: Math.round(food.fats_per_100g * 10) / 10
    }));
  };

  const calculateTodayTotals = () => {
    return todayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
        carbs: totals.carbs + meal.carbs,
        fats: totals.fats + meal.fats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const todayTotals = calculateTodayTotals();

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nutrition</h1>
          <p className="text-sm sm:text-base text-gray-600">Track your meals and reach your nutrition goals</p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300 hover:shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Progress</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {/* Calories */}
          <div className="text-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - getProgressPercentage(todayTotals.calories, nutritionGoals.calories) / 100)}`}
                  className="text-blue-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {Math.round(getProgressPercentage(todayTotals.calories, nutritionGoals.calories))}%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Calories</p>
            <p className="text-xs text-gray-600">{todayTotals.calories} / {nutritionGoals.calories}</p>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - getProgressPercentage(todayTotals.protein, nutritionGoals.protein) / 100)}`}
                  className="text-green-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {Math.round(getProgressPercentage(todayTotals.protein, nutritionGoals.protein))}%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Protein</p>
            <p className="text-xs text-gray-600">{Math.round(todayTotals.protein)}g / {nutritionGoals.protein}g</p>
          </div>

          {/* Carbs */}
          <div className="text-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - getProgressPercentage(todayTotals.carbs, nutritionGoals.carbs) / 100)}`}
                  className="text-orange-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {Math.round(getProgressPercentage(todayTotals.carbs, nutritionGoals.carbs))}%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Carbs</p>
            <p className="text-xs text-gray-600">{Math.round(todayTotals.carbs)}g / {nutritionGoals.carbs}g</p>
          </div>

          {/* Fats */}
          <div className="text-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - getProgressPercentage(todayTotals.fats, nutritionGoals.fats) / 100)}`}
                  className="text-purple-600 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {Math.round(getProgressPercentage(todayTotals.fats, nutritionGoals.fats))}%
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Fats</p>
            <p className="text-xs text-gray-600">{Math.round(todayTotals.fats)}g / {nutritionGoals.fats}g</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button className="bg-white border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-lg p-4 hover:shadow-lg transition-all duration-300 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-900">Weekly Report</p>
              <p className="text-xs sm:text-sm text-gray-600">View nutrition trends</p>
            </div>
          </div>
        </button>

        <button className="bg-white border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-lg p-4 hover:shadow-lg transition-all duration-300 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-900">Meal Prep</p>
              <p className="text-xs sm:text-sm text-gray-600">Plan your meals</p>
            </div>
          </div>
        </button>

        <button className="bg-white border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] rounded-lg p-4 hover:shadow-lg transition-all duration-300 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-900">Scan Barcode</p>
              <p className="text-xs sm:text-sm text-gray-600">Quick food logging</p>
            </div>
          </div>
        </button>
      </div>

      {/* Add/Edit Meal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMeal ? 'Edit Meal' : 'Add Meal'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Food Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Food Database
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search for foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {searchTerm && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredFoods.map(food => (
                      <button
                        key={food.id}
                        onClick={() => selectFoodItem(food)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{food.name}</span>
                          <span className="text-sm text-gray-500">{food.calories_per_100g} cal/100g</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | F: {food.fats_per_100g}g
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.food_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, food_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Grilled Chicken"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Type
                    </label>
                    <select
                      value={formData.meal_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, meal_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.protein}
                      onChange={(e) => setFormData(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.carbs}
                      onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.fats}
                      onChange={(e) => setFormData(prev => ({ ...prev, fats: parseFloat(e.target.value) || 0 }))}
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
                    <span>{editingMeal ? 'Update' : 'Save'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Today's Meals */}
      <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-lg">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Meals for {new Date(selectedDate).toLocaleDateString()}
          </h2>
        </div>

        {todayMeals.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
              const mealsOfType = todayMeals.filter(meal => meal.meal_type === mealType);
              const Icon = mealTypeIcons[mealType as keyof typeof mealTypeIcons];
              
              if (mealsOfType.length === 0) return null;

              return (
                <div key={mealType} className="p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 capitalize">{mealType}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {mealsOfType.map(meal => (
                      <div key={meal.id} className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{meal.food_name}</h4>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <span>{meal.calories} cal</span>
                            <span>P: {Math.round(meal.protein)}g</span>
                            <span>C: {Math.round(meal.carbs)}g</span>
                            <span>F: {Math.round(meal.fats)}g</span>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(meal)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                            title="Edit meal"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 rounded-lg hover:bg-red-50"
                            title="Delete meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Apple className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No meals logged</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Start tracking your nutrition for this day</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Add Your First Meal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionTab;