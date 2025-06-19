import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Smartphone, 
  Save, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun,
  Globe,
  Ruler,
  Weight,
  Calendar,
  Mail,
  Lock,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { userProfileService, userSettingsService, UserProfileInput, UserSettingsInput } from '../../lib/database';
import LoadingSpinner from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProfileData {
  dateOfBirth: string;
  weight: string;
  height: string;
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
}

interface NotificationSettings {
  workoutReminders: boolean;
  mealReminders: boolean;
  goalDeadlines: boolean;
  weeklyReports: boolean;
  achievements: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareWorkouts: boolean;
  shareProgress: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

interface AppSettings {
  autoSync: boolean;
  offlineMode: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  cacheSize: 'small' | 'medium' | 'large';
  backgroundRefresh: boolean;
}

const SettingsTab: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, unitsSystem, toggleUnits } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    dateOfBirth: '',
    weight: '',
    height: '',
    weightUnit: 'kg',
    heightUnit: 'cm'
  });

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    workoutReminders: true,
    mealReminders: true,
    goalDeadlines: true,
    weeklyReports: true,
    achievements: true,
    emailNotifications: true,
    pushNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'friends',
    shareWorkouts: true,
    shareProgress: true,
    dataCollection: true,
    analytics: true
  });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    autoSync: true,
    offlineMode: false,
    dataUsage: 'medium',
    cacheSize: 'medium',
    backgroundRefresh: true
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Update profile units when global units system changes
  useEffect(() => {
    setProfileData(prev => ({
      ...prev,
      weightUnit: unitsSystem === 'metric' ? 'kg' : 'lbs',
      heightUnit: unitsSystem === 'metric' ? 'cm' : 'ft'
    }));
  }, [unitsSystem]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [profile, settings] = await Promise.all([
        userProfileService.get(user.id),
        userSettingsService.get(user.id)
      ]);

      if (profile) {
        setProfileData({
          dateOfBirth: profile.date_of_birth || '',
          weight: profile.weight?.toString() || '',
          height: profile.height?.toString() || '',
          weightUnit: profile.weight_unit,
          heightUnit: profile.height_unit
        });
      }

      if (settings) {
        // Load theme and units from context
        // Other settings would be loaded from the database in a real app
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const profileInput: UserProfileInput = {
        date_of_birth: profileData.dateOfBirth || undefined,
        weight: profileData.weight ? parseFloat(profileData.weight) : undefined,
        height: profileData.height ? parseFloat(profileData.height) : undefined,
        weight_unit: profileData.weightUnit,
        height_unit: profileData.heightUnit
      };

      await userProfileService.upsert(user.id, profileInput);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // In a real app, you would save notification settings to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Notification settings saved!');
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle weight unit change
  const handleWeightUnitChange = (unit: 'kg' | 'lbs') => {
    setProfileData(prev => {
      let convertedWeight = prev.weight;
      
      // Convert weight if there's a value
      if (prev.weight && prev.weightUnit !== unit) {
        const weightValue = parseFloat(prev.weight);
        if (unit === 'lbs' && prev.weightUnit === 'kg') {
          // Convert kg to lbs
          convertedWeight = (weightValue * 2.20462).toFixed(1);
        } else if (unit === 'kg' && prev.weightUnit === 'lbs') {
          // Convert lbs to kg
          convertedWeight = (weightValue / 2.20462).toFixed(1);
        }
      }
      
      return {
        ...prev,
        weightUnit: unit,
        weight: convertedWeight
      };
    });
  };

  // Handle height unit change
  const handleHeightUnitChange = (unit: 'cm' | 'ft') => {
    setProfileData(prev => {
      let convertedHeight = prev.height;
      
      // Convert height if there's a value
      if (prev.height && prev.heightUnit !== unit) {
        const heightValue = parseFloat(prev.height);
        if (unit === 'ft' && prev.heightUnit === 'cm') {
          // Convert cm to ft (as decimal)
          convertedHeight = (heightValue / 30.48).toFixed(1);
        } else if (unit === 'cm' && prev.heightUnit === 'ft') {
          // Convert ft to cm
          convertedHeight = (heightValue * 30.48).toFixed(0);
        }
      }
      
      return {
        ...prev,
        heightUnit: unit,
        height: convertedHeight
      };
    });
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'app', label: 'App Settings', icon: Smartphone }
  ];

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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      {/* Mobile Section Selector */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop and Mobile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden sm:block lg:col-span-1">
          <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          step="0.1"
                          value={profileData.weight}
                          onChange={(e) => setProfileData(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter weight"
                        />
                      </div>
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleWeightUnitChange('kg')}
                          className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            profileData.weightUnit === 'kg'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          kg
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightUnitChange('lbs')}
                          className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-l border-gray-200 ${
                            profileData.weightUnit === 'lbs'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          lbs
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          step="0.1"
                          value={profileData.height}
                          onChange={(e) => setProfileData(prev => ({ ...prev, height: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter height"
                        />
                      </div>
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleHeightUnitChange('cm')}
                          className={`px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            profileData.heightUnit === 'cm'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          cm
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHeightUnitChange('ft')}
                          className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-l border-gray-200 ${
                            profileData.heightUnit === 'ft'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          ft
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme and Units */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme Preference
                    </label>
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Sun className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-gray-900 capitalize">{theme} Mode</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                          theme === 'dark' ? 'translate-x-6 ml-1' : 'translate-x-1'
                        }`}></div>
                      </div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units System
                    </label>
                    <button
                      onClick={toggleUnits}
                      className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-900 capitalize">{unitsSystem}</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        unitsSystem === 'imperial' ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                          unitsSystem === 'imperial' ? 'translate-x-6 ml-1' : 'translate-x-1'
                        }`}></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notification Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Workout Notifications */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Workout Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Get reminded about your scheduled workouts' },
                      { key: 'achievements', label: 'Achievement Alerts', desc: 'Celebrate your fitness milestones' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setNotificationSettings(prev => ({ 
                              ...prev, 
                              [item.key]: !prev[item.key as keyof NotificationSettings] 
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nutrition Notifications */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Nutrition Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'mealReminders', label: 'Meal Reminders', desc: 'Get reminded to log your meals' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly nutrition summaries' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setNotificationSettings(prev => ({ 
                              ...prev, 
                              [item.key]: !prev[item.key as keyof NotificationSettings] 
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication Preferences */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Communication Preferences</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications on your device' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setNotificationSettings(prev => ({ 
                              ...prev, 
                              [item.key]: !prev[item.key as keyof NotificationSettings] 
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                              notificationSettings[item.key as keyof NotificationSettings] ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Notification Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Privacy Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Profile Visibility */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Profile Visibility</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                      { value: 'friends', label: 'Friends Only', desc: 'Only your friends can see your profile' },
                      { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={privacySettings.profileVisibility === option.value}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Data Sharing */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Data Sharing</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'shareWorkouts', label: 'Share Workouts', desc: 'Allow others to see your workout activities' },
                      { key: 'shareProgress', label: 'Share Progress', desc: 'Allow others to see your fitness progress' },
                      { key: 'dataCollection', label: 'Data Collection', desc: 'Allow us to collect usage data to improve the app' },
                      { key: 'analytics', label: 'Analytics', desc: 'Allow us to use your data for analytics purposes' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setPrivacySettings(prev => ({ 
                              ...prev, 
                              [item.key]: !prev[item.key as keyof PrivacySettings] 
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              privacySettings[item.key as keyof PrivacySettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                              privacySettings[item.key as keyof PrivacySettings] ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Settings Section */}
          {activeSection === 'app' && (
            <div className="bg-white rounded-lg border border-[#e0e7ff] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Smartphone className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">App Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Sync Settings */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Sync & Storage</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'autoSync', label: 'Auto Sync', desc: 'Automatically sync your data across devices' },
                      { key: 'backgroundRefresh', label: 'Background Refresh', desc: 'Allow the app to refresh data in the background' }
                    ].map((item) => (
                      <div key={item.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => setAppSettings(prev => ({ 
                              ...prev, 
                              [item.key]: !prev[item.key as keyof AppSettings] 
                            }))}
                            className={`w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              appSettings[item.key as keyof AppSettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                              appSettings[item.key as keyof AppSettings] ? 'translate-x-6 ml-1' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Usage */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Data Usage</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Low', desc: 'Minimal data usage, basic features only' },
                      { value: 'medium', label: 'Medium', desc: 'Balanced data usage with most features' },
                      { value: 'high', label: 'High', desc: 'Full features with high-quality content' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="dataUsage"
                          value={option.value}
                          checked={appSettings.dataUsage === option.value}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, dataUsage: e.target.value as any }))}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cache Settings */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Cache Size</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'small', label: 'Small (50MB)', desc: 'Minimal cache for basic functionality' },
                      { value: 'medium', label: 'Medium (200MB)', desc: 'Balanced cache for good performance' },
                      { value: 'large', label: 'Large (500MB)', desc: 'Large cache for optimal performance' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="cacheSize"
                          value={option.value}
                          checked={appSettings.cacheSize === option.value}
                          onChange={(e) => setAppSettings(prev => ({ ...prev, cacheSize: e.target.value as any }))}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear Cache</span>
                  </button>
                  <button className="flex-1 sm:flex-none bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;