import React, { useEffect, useRef, useState } from 'react';
import { Activity, Target, Users, BarChart3, Heart, Trophy } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const features = [
  {
    icon: Activity,
    title: 'Smart Tracking',
    description: 'Automatically track your workouts, steps, and activities with advanced AI-powered recognition.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    darkBgColor: 'rgba(33, 150, 243, 0.1)'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set personalized fitness goals and get intelligent recommendations to achieve them faster.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    darkBgColor: 'rgba(76, 175, 80, 0.1)'
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description: 'Visualize your progress with detailed charts and insights that motivate continuous improvement.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    darkBgColor: 'rgba(156, 39, 176, 0.1)'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with like-minded fitness enthusiasts and share your journey for extra motivation.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    darkBgColor: 'rgba(255, 152, 0, 0.1)'
  },
  {
    icon: Heart,
    title: 'Health Monitoring',
    description: 'Monitor vital signs, sleep patterns, and recovery metrics for comprehensive health insights.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    darkBgColor: 'rgba(244, 67, 54, 0.1)'
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Unlock badges, complete challenges, and celebrate milestones on your fitness journey.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    darkBgColor: 'rgba(255, 193, 7, 0.1)'
  }
];

const Features: React.FC = () => {
  const { theme } = useTheme();
  const [visibleCards, setVisibleCards] = useState<boolean[]>(new Array(features.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cardRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setTimeout(() => {
                setVisibleCards(prev => {
                  const newVisible = [...prev];
                  newVisible[index] = true;
                  return newVisible;
                });
              }, index * 100); // Stagger animation
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="features" 
      className="py-20 lg:py-24"
      style={{ backgroundColor: theme === 'dark' ? 'var(--bg-primary)' : '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-16 lg:mb-20">
          <h2 
            className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
          >
            Everything You Need to
            <br />
            <span className="text-blue-600">Succeed</span>
          </h2>
          <p 
            className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
          >
            Our comprehensive suite of tools and features is designed to support every aspect 
            of your fitness journey, from tracking to motivation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                ref={el => cardRefs.current[index] = el}
                className={`group p-8 lg:p-10 rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:scale-105 ${
                  visibleCards[index] ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{
                  backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
                  borderColor: theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6',
                  boxShadow: theme === 'dark' ? 'var(--shadow-lg)' : '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.boxShadow = theme === 'dark' 
                    ? '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 99, 235, 0.2)'
                    : '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(37, 99, 235, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6';
                  e.currentTarget.style.boxShadow = theme === 'dark' ? 'var(--shadow-lg)' : '0 4px 6px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div 
                  className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-6 lg:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  style={{
                    backgroundColor: theme === 'dark' ? feature.darkBgColor : feature.bgColor
                  }}
                >
                  <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${feature.color}`} />
                </div>
                
                <h3 
                  className="text-xl lg:text-2xl font-bold mb-4 lg:mb-5 group-hover:text-blue-600 transition-colors duration-300"
                  style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className="leading-relaxed lg:text-lg group-hover:text-opacity-80 transition-colors duration-300 mb-6 lg:mb-8"
                  style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
                >
                  {feature.description}
                </p>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1 group/btn">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;