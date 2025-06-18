import React from 'react';
import { Activity, Twitter, Instagram, Facebook, Github } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Visual Separator */}
      <div 
        className="h-px"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)'
            : 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent)'
        }}
      ></div>
      
      <footer 
        className="border-t-4 border-blue-600 mt-16 lg:mt-20"
        style={{
          backgroundColor: theme === 'dark' ? 'var(--bg-primary)' : '#1f2937',
          color: '#ffffff'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-16 lg:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 xl:gap-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6 lg:mb-8">
                <div className="relative">
                  <Activity className="h-8 w-8 lg:h-10 lg:w-10 text-blue-400" />
                </div>
                <span className="text-2xl lg:text-3xl font-bold">FitTrack</span>
              </div>
              <p 
                className="mb-6 lg:mb-8 leading-relaxed lg:text-lg"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#9ca3af' }}
              >
                Empowering your fitness journey with intelligent tracking, 
                personalized insights, and a supportive community.
              </p>
              <div className="flex space-x-4">
                {[
                  { Icon: Twitter, color: 'hover:bg-blue-600', label: 'Twitter' },
                  { Icon: Instagram, color: 'hover:bg-pink-600', label: 'Instagram' },
                  { Icon: Facebook, color: 'hover:bg-blue-700', label: 'Facebook' },
                  { Icon: Github, color: 'hover:bg-gray-700', label: 'GitHub' }
                ].map(({ Icon, color, label }, index) => (
                  <a
                    key={index}
                    href="#"
                    className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center transition-all duration-300 group transform hover:scale-110 ${color}`}
                    style={{
                      backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#374151'
                    }}
                    aria-label={label}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Icon 
                      className="w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-300"
                      style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-6 lg:mb-8">Product</h3>
              <ul className="space-y-3 lg:space-y-4">
                {['Features', 'Pricing', 'Integrations', 'API'].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="transition-all duration-200 lg:text-lg hover:scale-105 inline-block"
                      style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-6 lg:mb-8">Company</h3>
              <ul className="space-y-3 lg:space-y-4">
                {['About Us', 'Careers', 'Blog', 'Press'].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="transition-all duration-200 lg:text-lg hover:scale-105 inline-block"
                      style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg lg:text-xl mb-6 lg:mb-8">Support</h3>
              <ul className="space-y-3 lg:space-y-4">
                {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="transition-all duration-200 lg:text-lg hover:scale-105 inline-block"
                      style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'dark' ? 'var(--text-tertiary)' : '#9ca3af';
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div 
            className="border-t mt-12 lg:mt-16 pt-8 lg:pt-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
            style={{ borderColor: theme === 'dark' ? 'var(--border-primary)' : '#374151' }}
          >
            <p 
              className="text-sm lg:text-base"
              style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
            >
              © {currentYear} FitTrack. All rights reserved.
            </p>
            <p 
              className="text-sm lg:text-base"
              style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
            >
              Designed and Developed with ❤️ by Dhiraj Sah

            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;