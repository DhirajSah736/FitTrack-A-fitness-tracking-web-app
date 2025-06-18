import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Dumbbell,
  Apple,
  Target,
  BarChart3,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import DashboardFooter from './DashboardFooter';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange 
}) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex theme-transition" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(180deg, var(--bg-primary) 0%, var(--surface) 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          height: '100vh',
          position: 'fixed',
          boxShadow: theme === 'dark' ? 'var(--shadow-xl)' : '2px 0 4px rgba(0,0,0,0.1)',
          borderRight: `1px solid ${theme === 'dark' ? 'var(--border-primary)' : '#e2e8f0'}`
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>FitTrack</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg transition-all duration-200 glow-on-hover"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'shadow-md transform scale-105' 
                      : 'hover:transform hover:scale-105 hover:shadow-md'
                    }
                  `}
                  style={{
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? 'var(--accent-primary)' : '#dbeafe')
                      : 'transparent',
                    color: isActive 
                      ? (theme === 'dark' ? '#ffffff' : '#2563eb')
                      : 'var(--text-secondary)',
                    boxShadow: isActive 
                      ? (theme === 'dark' ? '0 0 20px rgba(33, 150, 243, 0.3)' : '0 4px 6px rgba(37, 99, 235, 0.1)')
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'var(--surface-elevated)' : '#f1f5f9';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="px-4 py-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group hover:transform hover:scale-105"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'var(--surface-elevated)' : '#f1f5f9';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              )}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white status-online"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 group hover:transform hover:scale-105"
              style={{
                color: 'var(--text-secondary)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fef2f2';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {isSigningOut ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              )}
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-64">
        {/* Mobile Header */}
        <header 
          className="lg:hidden shadow-sm border-b px-4 py-3"
          style={{ 
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg transition-all duration-200 glow-on-hover"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>FitTrack</span>
            </div>
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <main 
          className="flex-1 overflow-auto"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="p-6 lg:p-8 pb-4">
            {children}
          </div>
        </main>

        {/* Premium Dashboard Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
};

export default DashboardLayout;