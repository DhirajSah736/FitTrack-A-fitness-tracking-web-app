import React, { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartJourney = () => {
    navigate('/login');
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center gradient-mesh overflow-hidden"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.9) 50%, rgba(45, 45, 45, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.05) 50%, rgba(37, 99, 235, 0.15) 100%)'
      }}
    >
      {/* Enhanced Background Elements */}
      <div 
        className="absolute top-20 right-10 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(0, 188, 212, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)'
        }}
      ></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-20">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-24 items-center">
          {/* Content Column */}
          <div className={`space-y-8 lg:space-y-10 px-4 sm:px-0 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* Visual Separator for Desktop */}
            <div 
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2"
              style={{
                background: theme === 'dark' 
                  ? 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0), transparent)'
                  : 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0), transparent)'
              }}
            ></div>
            
            <div className="space-y-6 lg:space-y-8">
              <h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight lg:leading-tight"
                style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
              >
                {/* Fixed typing effect with proper width calculation for fullscreen */}
                <span 
                  className="typing-effect block mb-2 lg:mb-4 overflow-hidden pr-2"
                  style={{
                    whiteSpace: 'nowrap',
                    width: 'fit-content',
                    maxWidth: '100%',
                    minWidth: '320px' // Ensure minimum width for "Track. Progress."
                  }}
                >
                  Track. Progress.
                </span>
                <span className="text-blue-600">Achieve.</span>
              </h1>
              <p 
                className="text-lg sm:text-xl lg:text-xl max-w-lg leading-relaxed lg:leading-relaxed"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
              >
                Transform your fitness journey with intelligent tracking, personalized insights, 
                and a community that motivates you to reach new heights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 lg:gap-4 pt-4 lg:pt-6">
              <button 
                onClick={handleStartJourney}
                className="group px-8 py-4 lg:py-5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 min-h-[3.5rem] lg:min-h-[4rem]"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
                }}
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button 
                className="group flex items-center justify-center space-x-2 px-8 py-4 lg:py-5 rounded-xl border-2 transition-all duration-300 hover:shadow-lg min-h-[3.5rem] lg:min-h-[4rem]"
                style={{
                  borderColor: theme === 'dark' ? 'var(--border-secondary)' : '#d1d5db',
                  backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  color: theme === 'dark' ? 'var(--text-primary)' : '#374151',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
                  e.currentTarget.style.color = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--border-secondary)' : '#d1d5db';
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.color = theme === 'dark' ? 'var(--text-primary)' : '#374151';
                }}
              >
                <Play className="w-5 h-5 text-blue-600" />
                <span className="font-semibold transition-colors duration-200">
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-6 sm:space-y-0 pt-8 lg:pt-12">
              <div className="text-center sm:text-left">
                <div 
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                >
                  100K+
                </div>
                <div 
                  className="text-sm lg:text-base mt-1"
                  style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                >
                  Active Users
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div 
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                >
                  50M+
                </div>
                <div 
                  className="text-sm lg:text-base mt-1"
                  style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                >
                  Workouts Tracked
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div 
                  className="text-2xl lg:text-3xl font-bold"
                  style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                >
                  4.9
                </div>
                <div 
                  className="text-sm lg:text-base mt-1"
                  style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                >
                  App Rating
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Illustration Column */}
          <div className={`relative mt-12 lg:mt-0 px-4 sm:px-0 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="relative lg:pl-8 xl:pl-12">
              {/* Enhanced Phone mockup */}
              <div 
                className="rounded-3xl p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 mx-auto max-w-sm lg:max-w-none"
                style={{
                  background: theme === 'dark' 
                    ? 'linear-gradient(145deg, #1f2937, #111827)'
                    : 'linear-gradient(145deg, #374151, #1f2937)',
                  boxShadow: theme === 'dark' 
                    ? '0 25px 50px rgba(0, 0, 0, 0.5)'
                    : '0 25px 50px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div 
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: theme === 'dark' ? 'var(--surface)' : '#ffffff'
                  }}
                >
                  <div 
                    className="h-80 lg:h-96 flex items-center justify-center"
                    style={{
                      background: theme === 'dark' 
                        ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(45, 45, 45, 0.9))'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                    }}
                  >
                    <div className="text-center p-6 lg:p-8">
                      <div className="w-14 lg:w-16 h-14 lg:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 lg:mb-6 flex items-center justify-center shadow-lg">
                        <svg className="w-7 lg:w-8 h-7 lg:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 
                        className="text-lg lg:text-xl font-semibold mb-2 lg:mb-3"
                        style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                      >
                        Workout Complete!
                      </h3>
                      <p 
                        className="text-sm lg:text-base mb-4 lg:mb-6"
                        style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
                      >
                        You burned 340 calories in 45 minutes
                      </p>
                      <div className="space-y-2 lg:space-y-3">
                        <div 
                          className="h-2 lg:h-3 rounded-full"
                          style={{ backgroundColor: theme === 'dark' ? 'var(--bg-tertiary)' : '#e5e7eb' }}
                        >
                          <div className="h-2 lg:h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                        <div 
                          className="text-xs lg:text-sm"
                          style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
                        >
                          Daily Goal: 75% Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating cards */}
              <div 
                className="absolute -top-4 -left-2 lg:-left-4 p-3 lg:p-4 rounded-lg shadow-lg animate-bounce glass-morphism"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse status-online"></div>
                  <span 
                    className="text-xs lg:text-sm font-medium"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                  >
                    Live tracking
                  </span>
                </div>
              </div>
              
              <div 
                className="absolute -bottom-4 -right-2 lg:-right-4 p-3 lg:p-4 rounded-lg shadow-lg glass-morphism"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                }}
              >
                <div 
                  className="text-xl lg:text-2xl font-bold text-blue-600"
                >
                  127
                </div>
                <div 
                  className="text-xs"
                  style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                >
                  BPM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;