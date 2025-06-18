import React from 'react';
import { Github, Linkedin, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardFooter: React.FC = () => {
  const { theme } = useTheme();

  const socialLinks = [
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/DhirajSah736',
      hoverColor: 'hover:text-gray-800 dark:hover:text-gray-200'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://www.linkedin.com/in/dhiraj-sah-7a3522220/',
      hoverColor: 'hover:text-blue-600'
    },
    {
      name: 'Portfolio',
      icon: ExternalLink,
      url: 'https://www.dhirajsah99.com.np/',
      hoverColor: 'hover:text-purple-600'
    }
  ];

  return (
    <footer 
      className="h-16 border-t flex items-center justify-between px-6 lg:px-8 transition-all duration-300"
      style={{ 
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8fafb',
        borderTopColor: theme === 'dark' ? '#2d2d2d' : '#e2e8f0',
        borderTopWidth: '1px'
      }}
    >
      {/* Left side content - Copyright */}
      <div className="flex items-center">
        <p 
          className="text-sm"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#64748b' }}
        >
          © 2025 FitTrack. All rights reserved.
        </p>
      </div>

      {/* Right side content - Text and Social Media Icons */}
      <div className="flex items-center space-x-6">
        {/* Footer Text */}
        <div className="flex items-center space-x-1 text-sm">
          <span style={{ color: theme === 'dark' ? '#e0e0e0' : '#64748b' }}>
            Designed and Developed with ❤️ by 
          </span>
          <span 
            className="font-semibold ml-1 transition-all duration-200 hover:scale-105 cursor-default"
            style={{ 
              color: theme === 'light' ? '#0d0d0c' : '#FFD700'
            }}
          >
            Dhiraj Sah
          </span>
        </div>

        {/* Social Media Icons */}
        <div className="flex items-center space-x-3">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 ${social.hoverColor}`}
                style={{
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(45, 45, 45, 0.8)' : 'rgba(241, 245, 249, 0.8)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={`Visit ${social.name} profile`}
                aria-label={`Visit ${social.name} profile`}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;