import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Newsletter: React.FC = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setMessage('Thank you for subscribing! Check your email for confirmation.');
      setEmail('');
    }, 1500);
  };

  return (
    <section 
      id="newsletter" 
      className="py-20 lg:py-24 relative overflow-hidden"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
      }}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: theme === 'dark' ? 0.1 : 0.05 }}>
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='${theme === 'dark' ? '0.1' : '0.05'}' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40zm40 0v-40h-40l40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div 
        className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl opacity-30"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(33, 150, 243, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)'
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-20 w-40 h-40 rounded-full blur-2xl opacity-20"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(0, 188, 212, 0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)'
        }}
      ></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 relative">
        <div className="text-center">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-full mb-8 lg:mb-12 shadow-lg animate-pulse-glow"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`
            }}
          >
            <Mail className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 lg:mb-8">
            Stay Updated
          </h2>
          
          <p 
            className="text-lg lg:text-xl mb-12 lg:mb-16 max-w-2xl mx-auto leading-relaxed"
            style={{ color: theme === 'dark' ? 'rgba(224, 224, 224, 0.9)' : 'rgba(219, 234, 254, 0.9)' }}
          >
            Get the latest fitness tips, app updates, and exclusive content delivered straight to your inbox.
            Join over 50,000 fitness enthusiasts who trust our insights.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-6 py-4 lg:py-5 rounded-xl border-0 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 text-base lg:text-lg"
                  style={{
                    backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'}`,
                    color: '#ffffff'
                  }}
                  disabled={status === 'loading'}
                />
                <style jsx>{`
                  input::placeholder {
                    color: ${theme === 'dark' ? 'rgba(224, 224, 224, 0.7)' : 'rgba(219, 234, 254, 0.8)'};
                  }
                `}</style>
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-4 lg:py-5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[3.5rem] lg:min-h-[4rem] text-base lg:text-lg"
                style={{
                  backgroundColor: theme === 'dark' ? '#2563eb' : '#ffffff',
                  color: theme === 'dark' ? '#ffffff' : '#2563eb'
                }}
                onMouseEnter={(e) => {
                  if (status !== 'loading') {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1d4ed8' : '#f8fafc';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (status !== 'loading') {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2563eb' : '#ffffff';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  }
                }}
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {status === 'success' && (
              <div 
                className="mt-6 lg:mt-8 p-4 lg:p-6 rounded-lg border animate-fade-in"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderColor: theme === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(34, 197, 94, 0.3)'
                }}
              >
                <div className="flex items-center justify-center space-x-2 text-green-100">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium text-sm lg:text-base">{message}</span>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div 
                className="mt-6 lg:mt-8 p-4 lg:p-6 rounded-lg border animate-fade-in"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderColor: theme === 'dark' ? 'rgba(244, 67, 54, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="flex items-center justify-center space-x-2 text-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium text-sm lg:text-base">{message}</span>
                </div>
              </div>
            )}
          </form>

          <p 
            className="text-sm lg:text-base mt-6 lg:mt-8"
            style={{ color: theme === 'dark' ? 'rgba(224, 224, 224, 0.7)' : 'rgba(219, 234, 254, 0.8)' }}
          >
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;