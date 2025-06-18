import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

// Types
export interface Workout {
  id: string;
  user_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  type: 'weight' | 'strength' | 'consistency';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  start_date: string;
  end_date: string;
  status: 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  weight?: number;
  height?: number;
  weight_unit: 'kg' | 'lbs';
  height_unit: 'cm' | 'ft';
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  units_system: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  language: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutInput {
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: string;
  notes?: string;
}

export interface MealInput {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  consumed_at?: string;
}

export interface GoalInput {
  type: 'weight' | 'strength' | 'consistency';
  title: string;
  description?: string;
  target_value: number;
  current_value?: number;
  start_date: string;
  end_date: string;
}

export interface UserProfileInput {
  date_of_birth?: string;
  weight?: number;
  height?: number;
  weight_unit?: 'kg' | 'lbs';
  height_unit?: 'cm' | 'ft';
}

export interface UserSettingsInput {
  units_system?: 'metric' | 'imperial';
  theme?: 'light' | 'dark';
  language?: string;
  notifications_enabled?: boolean;
}

// Workout functions
export const workoutService = {
  async getAll(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(userId: string, workout: WorkoutInput): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert([{ ...workout, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, workout: Partial<WorkoutInput>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(workout)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Meal functions
export const mealService = {
  async getAll(userId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('consumed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(userId: string, meal: MealInput): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .insert([{ ...meal, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, meal: Partial<MealInput>): Promise<Meal> {
    const { data, error } = await supabase
      .from('meals')
      .update(meal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getByDate(userId: string, date: string): Promise<Meal[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', startOfDay.toISOString())
      .lte('consumed_at', endOfDay.toISOString())
      .order('consumed_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};

// Goal functions
export const goalService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(userId: string, goal: GoalInput): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, goal: Partial<GoalInput & { status?: Goal['status'] }>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(goal)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async updateProgress(id: string, currentValue: number): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({ current_value: currentValue })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// User Profile functions
export const userProfileService = {
  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsert(userId: string, profile: UserProfileInput): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{ ...profile, user_id: userId }], {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, profile: Partial<UserProfileInput>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// User Settings functions
export const userSettingsService = {
  async get(userId: string): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsert(userId: string, settings: UserSettingsInput): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert([{ ...settings, user_id: userId }], {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(userId: string, settings: Partial<UserSettingsInput>): Promise<UserSettings> {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Analytics functions
export const analyticsService = {
  async getWorkoutStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const workouts = await workoutService.getByDateRange(
      userId,
      startDate.toISOString(),
      new Date().toISOString()
    );

    const totalWorkouts = workouts.length;
    const uniqueExercises = new Set(workouts.map(w => w.exercise_name)).size;
    const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
    const totalReps = workouts.reduce((sum, w) => sum + w.reps, 0);
    const averageWeight = workouts
      .filter(w => w.weight)
      .reduce((sum, w, _, arr) => sum + (w.weight || 0) / arr.length, 0);

    return {
      totalWorkouts,
      uniqueExercises,
      totalSets,
      totalReps,
      averageWeight: Math.round(averageWeight * 100) / 100,
      workoutFrequency: Math.round((totalWorkouts / days) * 100) / 100
    };
  },

  async getNutritionStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: meals, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('consumed_at', startDate.toISOString());

    if (error) throw error;

    const totalCalories = meals?.reduce((sum, m) => sum + m.calories, 0) || 0;
    const totalProtein = meals?.reduce((sum, m) => sum + m.protein, 0) || 0;
    const totalCarbs = meals?.reduce((sum, m) => sum + m.carbs, 0) || 0;
    const totalFats = meals?.reduce((sum, m) => sum + m.fats, 0) || 0;

    return {
      totalCalories,
      totalProtein: Math.round(totalProtein * 100) / 100,
      totalCarbs: Math.round(totalCarbs * 100) / 100,
      totalFats: Math.round(totalFats * 100) / 100,
      averageCaloriesPerDay: Math.round((totalCalories / days) * 100) / 100,
      mealCount: meals?.length || 0
    };
  }
};

// Unit conversion utilities
export const unitConversions = {
  // Weight conversions
  kgToLbs: (kg: number): number => Math.round(kg * 2.20462 * 100) / 100,
  lbsToKg: (lbs: number): number => Math.round(lbs / 2.20462 * 100) / 100,
  
  // Height conversions
  cmToFt: (cm: number): string => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  },
  
  ftToCm: (feet: number, inches: number = 0): number => {
    return Math.round((feet * 12 + inches) * 2.54 * 100) / 100;
  },
  
  // Parse feet/inches string like "5'10"" to separate values
  parseFeetInches: (ftStr: string): { feet: number; inches: number } => {
    const match = ftStr.match(/(\d+)'(\d+)"/);
    if (match) {
      return { feet: parseInt(match[1]), inches: parseInt(match[2]) };
    }
    return { feet: 0, inches: 0 };
  }
};