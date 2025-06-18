import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Activity, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  // Don't show navbar on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? theme === 'dark' 
            ? 'bg-gray-900/95 backdrop-blur-lg shadow-xl border-b border-gray-700'
            : 'bg-white/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent'
      }`}
      style={{
        backgroundColor: isScrolled 
          ? (theme === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)')
          : 'transparent'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="relative">
              <Activity className="h-8 w-8 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
            </div>
            <span 
              className="text-xl font-bold transition-colors duration-200"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
            >
              FitTrack
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <a 
                  href="#features" 
                  className="font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                  }}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                  }}
                >
                  Reviews
                </a>
                <a 
                  href="#newsletter" 
                  className="font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                  }}
                >
                  Newsletter
                </a>
              </>
            )}
          </div>

          {/* Desktop Auth Buttons and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110 group"
              style={{ 
                color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
              }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" />
              )}
            </button>

            {user ? (
              <>
                <button 
                  onClick={handleDashboardClick}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#dc2626';
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(220, 38, 38, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLoginClick}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: theme === 'dark' ? 'var(--text-secondary)' : '#374151',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Login
                </button>
                <button 
                  onClick={handleSignUpClick}
                  className="px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleMenu}
              className="transition-all duration-200 p-2 rounded-lg hover:scale-110"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div 
              className="px-2 pt-2 pb-3 space-y-1 rounded-lg mt-2 shadow-lg backdrop-blur-lg"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb'}`
              }}
            >
              {!user && (
                <>
                  <a
                    href="#features"
                    className="block px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                    style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Features
                  </a>
                  <a
                    href="#testimonials"
                    className="block px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                    style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Reviews
                  </a>
                  <a
                    href="#newsletter"
                    className="block px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                    style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#2563eb';
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#374151';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Newsletter
                  </a>
                </>
              )}
              <div className="pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                {user ? (
                  <>
                    <button 
                      onClick={() => {
                        handleDashboardClick();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                      style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                      style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        handleLoginClick();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 font-medium transition-all duration-200 rounded-lg"
                      style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => {
                        handleSignUpClick();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 mt-2"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff'
                      }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;