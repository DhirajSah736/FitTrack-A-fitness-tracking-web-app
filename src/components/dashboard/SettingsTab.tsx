import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Download, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Camera,
  Moon,
  Sun,
  Scale,
  Ruler,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  Database,
  Key,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { userProfileService, userSettingsService, UserProfile, UserSettings, unitConversions } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  weight: string;
  height: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  workoutReminders: boolean;
  mealReminders: boolean;
  goalDeadlines: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  soundEnabled: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showWorkouts: boolean;
  showNutrition: boolean;
  showGoals: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  dataRetention: 'forever' | '1year' | '6months';
}

const SettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, unitsSystem, toggleUnits } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    dateOfBirth: '',
    weight: '',
    height: '',
    weightUnit: 'kg',
    heightUnit: 'cm'
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    workoutReminders: true,
    mealReminders: true,
    goalDeadlines: true,
    weeklyReports: true,
    achievements: true,
    emailNotifications: true,
    pushNotifications: false,
    reminderFrequency: 'daily',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    soundEnabled: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    showWorkouts: true,
    showNutrition: false,
    showGoals: true,
    allowDataSharing: false,
    allowAnalytics: true,
    allowMarketing: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
    dataRetention: '1year'
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'app', label: 'App Settings', icon: Globe },
    { id: 'data', label: 'Data & Backup', icon: Download }
  ];

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const [profile, settings] = await Promise.all([
        userProfileService.get(user.id),
        userSettingsService.get(user.id)
      ]);

      if (profile) {
        setUserProfile(profile);
        setProfileForm(prev => ({
          ...prev,
          dateOfBirth: profile.date_of_birth || '',
          weight: profile.weight?.toString() || '',
          height: profile.height?.toString() || '',
          weightUnit: profile.weight_unit,
          heightUnit: profile.height_unit
        }));
      }

      if (settings) {
        setUserSettings(settings);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!profileForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (profileForm.dateOfBirth) {
      const birthDate = new Date(profileForm.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    if (profileForm.weight) {
      const weight = parseFloat(profileForm.weight);
      if (isNaN(weight) || weight <= 0 || weight > 1000) {
        errors.weight = 'Please enter a valid weight';
      }
    }

    if (profileForm.height) {
      const height = parseFloat(profileForm.height);
      if (profileForm.heightUnit === 'cm') {
        if (isNaN(height) || height < 50 || height > 300) {
          errors.height = 'Please enter a valid height (50-300 cm)';
        }
      } else {
        if (isNaN(height) || height < 2 || height > 9) {
          errors.height = 'Please enter a valid height (2-9 feet)';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfileForm() || !user) return;

    setLoading(true);
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: profileForm.email,
        data: {
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          full_name: `${profileForm.firstName} ${profileForm.lastName}`
        }
      });

      if (authError) throw authError;

      // Update user profile
      const profileData = {
        date_of_birth: profileForm.dateOfBirth || undefined,
        weight: profileForm.weight ? parseFloat(profileForm.weight) : undefined,
        height: profileForm.height ? parseFloat(profileForm.height) : undefined,
        weight_unit: profileForm.weightUnit,
        height_unit: profileForm.heightUnit
      };

      await userProfileService.upsert(user.id, profileData);
      
      toast.success('Profile updated successfully!');
      await loadUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would save these to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Privacy settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitsToggle = async () => {
    if (!user) return;

    const newUnits = unitsSystem === 'metric' ? 'imperial' : 'metric';
    
    // Convert existing values
    if (profileForm.weight) {
      const currentWeight = parseFloat(profileForm.weight);
      let convertedWeight: number;
      
      if (newUnits === 'imperial' && profileForm.weightUnit === 'kg') {
        convertedWeight = unitConversions.kgToLbs(currentWeight);
        setProfileForm(prev => ({ 
          ...prev, 
          weight: convertedWeight.toString(),
          weightUnit: 'lbs'
        }));
      } else if (newUnits === 'metric' && profileForm.weightUnit === 'lbs') {
        convertedWeight = unitConversions.lbsToKg(currentWeight);
        setProfileForm(prev => ({ 
          ...prev, 
          weight: convertedWeight.toString(),
          weightUnit: 'kg'
        }));
      }
    }

    if (profileForm.height) {
      const currentHeight = parseFloat(profileForm.height);
      
      if (newUnits === 'imperial' && profileForm.heightUnit === 'cm') {
        const ftInches = unitConversions.cmToFt(currentHeight);
        setProfileForm(prev => ({ 
          ...prev, 
          height: ftInches,
          heightUnit: 'ft'
        }));
      } else if (newUnits === 'metric' && profileForm.heightUnit === 'ft') {
        const { feet, inches } = unitConversions.parseFeetInches(profileForm.height);
        const cm = unitConversions.ftToCm(feet, inches);
        setProfileForm(prev => ({ 
          ...prev, 
          height: cm.toString(),
          heightUnit: 'cm'
        }));
      }
    }

    await toggleUnits();
    toast.success(`Switched to ${newUnits} units`);
  };

  const exportData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = {
        exportDate: new Date().toISOString(),
        profile: userProfile,
        settings: userSettings,
        note: 'This is a sample export. In a real app, this would contain all user data.'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fittrack-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
            <Camera className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-600">Upload a photo to personalize your profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.firstName ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {validationErrors.firstName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.lastName ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {validationErrors.lastName && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.email ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            value={profileForm.dateOfBirth}
            onChange={(e) => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {validationErrors.dateOfBirth && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight ({profileForm.weightUnit})
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.1"
              value={profileForm.weight}
              onChange={(e) => setProfileForm(prev => ({ ...prev, weight: e.target.value }))}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.weight ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder={profileForm.weightUnit === 'kg' ? '70' : '155'}
            />
            <div className="flex items-center space-x-1">
              <Scale className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profileForm.weightUnit}</span>
            </div>
          </div>
          {validationErrors.weight && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.weight}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height ({profileForm.heightUnit})
          </label>
          <div className="flex space-x-2">
            <input
              type={profileForm.heightUnit === 'ft' ? 'text' : 'number'}
              step={profileForm.heightUnit === 'cm' ? '0.1' : undefined}
              value={profileForm.height}
              onChange={(e) => setProfileForm(prev => ({ ...prev, height: e.target.value }))}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.height ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder={profileForm.heightUnit === 'cm' ? '175' : '5\'10"'}
            />
            <div className="flex items-center space-x-1">
              <Ruler className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profileForm.heightUnit}</span>
            </div>
          </div>
          {validationErrors.height && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.height}</p>
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Password</h4>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Change Password
          </button>
        </div>

        {showPasswordChange && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.currentPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.newPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <button
              onClick={changePassword}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Lock className="w-4 h-4" />}
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Save className="w-4 h-4" />}
          <span>{loading ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
        <p className="text-sm text-gray-600">Manage how and when you receive notifications</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {notifications.emailNotifications && (
          <div className="space-y-3 ml-8">
            {[
              { key: 'workoutReminders', label: 'Workout reminders' },
              { key: 'mealReminders', label: 'Meal tracking reminders' },
              { key: 'goalDeadlines', label: 'Goal deadline alerts' },
              { key: 'weeklyReports', label: 'Weekly progress reports' },
              { key: 'achievements', label: 'Achievement notifications' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof NotificationSettings] }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications[key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      notifications[key as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Push Notifications */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Receive instant notifications on your device</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              notifications.pushNotifications ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {!notifications.pushNotifications && (
          <div className="ml-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Enable push notifications to receive real-time updates about your fitness progress.
            </p>
          </div>
        )}
      </div>

      {/* Reminder Frequency */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-medium text-gray-900">Reminder Frequency</h4>
            <p className="text-sm text-gray-600">How often you want to receive reminders</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' }
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="reminderFrequency"
                value={value}
                checked={notifications.reminderFrequency === value}
                onChange={(e) => setNotifications(prev => ({ ...prev, reminderFrequency: e.target.value as any }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-gray-900">Quiet Hours</h4>
              <p className="text-sm text-gray-600">Set times when you don't want to receive notifications</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ 
              ...prev, 
              quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              notifications.quietHours.enabled ? 'bg-orange-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {notifications.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4 ml-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={notifications.quietHours.start}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  quietHours: { ...prev.quietHours, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={notifications.quietHours.end}
                onChange={(e) => setNotifications(prev => ({ 
                  ...prev, 
                  quietHours: { ...prev.quietHours, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sound Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {notifications.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-blue-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">Notification Sounds</h4>
              <p className="text-sm text-gray-600">Play sounds with notifications</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              notifications.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={saveNotificationSettings}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Save className="w-4 h-4" />}
          <span>{loading ? 'Saving...' : 'Save Notification Settings'}</span>
        </button>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy & Security</h3>
        <p className="text-sm text-gray-600">Control your privacy settings and data sharing preferences</p>
      </div>

      {/* Profile Visibility */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-gray-900">Profile Visibility</h4>
            <p className="text-sm text-gray-600">Who can see your profile information</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
            { value: 'friends', label: 'Friends Only', description: 'Only your friends can see your profile' },
            { value: 'private', label: 'Private', description: 'Only you can see your profile' }
          ].map(({ value, label, description }) => (
            <label key={value} className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white transition-colors">
              <input
                type="radio"
                name="profileVisibility"
                value={value}
                checked={privacy.profileVisibility === value}
                onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Data Sharing */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-5 h-5 text-green-600" />
          <div>
            <h4 className="font-medium text-gray-900">Data Sharing Preferences</h4>
            <p className="text-sm text-gray-600">Control what information you share</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'showWorkouts', label: 'Share workout data', description: 'Allow others to see your workout history' },
            { key: 'showNutrition', label: 'Share nutrition data', description: 'Allow others to see your meal logs' },
            { key: 'showGoals', label: 'Share goals', description: 'Allow others to see your fitness goals' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof PrivacySettings] }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  privacy[key as keyof PrivacySettings] ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    privacy[key as keyof PrivacySettings] ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Usage */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-purple-600" />
          <div>
            <h4 className="font-medium text-gray-900">Data Usage</h4>
            <p className="text-sm text-gray-600">How we use your data to improve our services</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'allowDataSharing', label: 'Anonymous data sharing', description: 'Help improve our services with anonymized data' },
            { key: 'allowAnalytics', label: 'Analytics', description: 'Allow us to analyze usage patterns' },
            { key: 'allowMarketing', label: 'Marketing communications', description: 'Receive promotional emails and offers' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors">
              <div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof PrivacySettings] }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  privacy[key as keyof PrivacySettings] ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    privacy[key as keyof PrivacySettings] ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-red-600" />
          <div>
            <h4 className="font-medium text-gray-900">Security Settings</h4>
            <p className="text-sm text-gray-600">Additional security measures for your account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors">
            <div>
              <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
              <p className="text-xs text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setPrivacy(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                privacy.twoFactorEnabled ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  privacy.twoFactorEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-lg hover:bg-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Session Timeout</span>
              <span className="text-sm text-gray-600">{privacy.sessionTimeout} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={privacy.sessionTimeout}
              onChange={(e) => setPrivacy(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 min</span>
              <span>2 hours</span>
            </div>
          </div>

          <div className="p-3 rounded-lg hover:bg-white transition-colors">
            <label className="block text-sm font-medium text-gray-900 mb-2">Data Retention</label>
            <select
              value={privacy.dataRetention}
              onChange={(e) => setPrivacy(prev => ({ ...prev, dataRetention: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="forever">Keep data forever</option>
              <option value="1year">Delete after 1 year</option>
              <option value="6months">Delete after 6 months</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">How long to keep your data after account deletion</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={savePrivacySettings}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Save className="w-4 h-4" />}
          <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
        </button>
      </div>
    </div>
  );

  const renderAppSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Units & Measurements</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Measurement System</p>
                <p className="text-sm text-gray-600">
                  Currently using {unitsSystem === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft/in)'}
                </p>
              </div>
            </div>
            <button
              onClick={handleUnitsToggle}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                unitsSystem === 'metric' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  unitsSystem === 'metric' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">Theme</p>
                <p className="text-sm text-gray-600">
                  Currently using {theme === 'light' ? 'Light' : 'Dark'} mode
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value="en"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 text-sm">
            Export all your fitness data including workouts, meals, goals, and progress. 
            The export will be in JSON format and may take a few minutes to prepare.
          </p>
        </div>
        <button
          onClick={exportData}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Download className="w-4 h-4" />}
          <span>{loading ? 'Preparing Export...' : 'Export My Data'}</span>
        </button>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-red-600">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="mb-4">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-red-700 text-sm mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" color="text-white" /> : <Trash2 className="w-4 h-4" />}
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return renderPrivacySection();
      case 'app': return renderAppSection();
      case 'data': return renderDataSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 transition-all duration-300 hover:shadow-lg">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;