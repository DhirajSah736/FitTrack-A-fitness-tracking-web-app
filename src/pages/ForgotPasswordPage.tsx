import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Mail, CheckCircle, AlertCircle, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const success = await resetPassword(email);
      if (success) {
        setIsSuccess(true);
        toast.success('Password reset email sent successfully!');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (isSuccess) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 theme-transition"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #dcfce7 100%)'
        }}
      >
        <div className="relative w-full max-w-md animate-fade-in">
          <div 
            className="rounded-2xl shadow-xl border p-8 backdrop-blur-sm text-center theme-transition"
            style={{
              backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
              borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb',
              boxShadow: theme === 'dark' ? 'var(--shadow-xl)' : '0 25px 50px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 
              className="text-2xl font-bold mb-4"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
            >
              Check Your Email
            </h1>
            
            <p 
              className="mb-6 leading-relaxed"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email and follow the instructions to reset your password.
            </p>

            <div 
              className="border rounded-lg p-4 mb-6"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.1)' : '#dbeafe',
                borderColor: theme === 'dark' ? 'rgba(33, 150, 243, 0.2)' : '#93c5fd'
              }}
            >
              <p 
                className="text-sm"
                style={{ color: theme === 'dark' ? '#60a5fa' : '#1d4ed8' }}
              >
                <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                }}
              >
                Back to Login
              </button>
              
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full py-2 font-medium transition-colors duration-200"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
                }}
              >
                Send to a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 theme-transition"
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
          : 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)'
      }}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0" style={{ opacity: theme === 'dark' ? 0.05 : 0.3 }}>
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234A90E2' fill-opacity='${theme === 'dark' ? '0.05' : '0.1'}'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div 
        className="absolute top-20 right-20 w-32 h-32 rounded-full blur-2xl opacity-30"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(33, 150, 243, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
        }}
      ></div>
      <div 
        className="absolute bottom-20 left-20 w-40 h-40 rounded-full blur-2xl opacity-20"
        style={{
          background: theme === 'dark' 
            ? 'radial-gradient(circle, rgba(0, 188, 212, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)'
        }}
      ></div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header with Back Button and Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 transition-all duration-200 group"
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
            }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
            style={{ 
              color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)';
              e.currentTarget.style.color = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Reset Password Card */}
        <div 
          className="rounded-2xl shadow-xl border p-8 backdrop-blur-sm theme-transition"
          style={{
            backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
            borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb',
            boxShadow: theme === 'dark' ? 'var(--shadow-xl)' : '0 25px 50px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <Activity className="h-12 w-12 text-blue-600" />
              <span 
                className="text-2xl font-bold"
                style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
              >
                FitTrack
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
            >
              Reset Password
            </h1>
            <p 
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail 
                  className="absolute left-4 top-4 w-5 h-5"
                  style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 outline-none ${
                    error 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                    borderColor: error 
                      ? '#fca5a5' 
                      : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb'),
                    color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                  }}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  disabled={isSubmitting}
                />
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-red-500 text-sm font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div 
              className="border rounded-lg p-4"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb'
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-sm" style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}>
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    For your security, the password reset link will expire in 1 hour. 
                    If you don't receive the email within a few minutes, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 min-h-[3.5rem]"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p 
              className="text-sm mb-4"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold transition-colors duration-200 hover:underline"
                style={{ color: '#2563eb' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
              >
                Sign in
              </Link>
            </p>
            
            <div 
              className="border-t pt-4"
              style={{ borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb' }}
            >
              <p 
                className="text-xs"
                style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
              >
                Need help? Contact our support team at{' '}
                <a 
                  href="mailto:support@fittrack.com" 
                  className="transition-colors duration-200"
                  style={{ color: '#2563eb' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                  }}
                >
                  support@fittrack.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;