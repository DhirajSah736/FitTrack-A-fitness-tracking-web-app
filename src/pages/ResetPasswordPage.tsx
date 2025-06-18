import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, Eye, EyeOff, CheckCircle, AlertCircle, Moon, Sun, Lock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setIsValidSession(false);
          return;
        }

        // Check if we have the required tokens from the URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            setIsValidSession(false);
            toast.error('Invalid or expired reset link');
          } else {
            setIsValidSession(true);
          }
        } else if (session) {
          // Already have a valid session
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          toast.error('Invalid or expired reset link');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsValidSession(false);
        toast.error('Failed to validate reset link');
      }
    };

    checkSession();
  }, [searchParams]);

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths = [
      { score: 0, label: 'Very Weak', color: '#ef4444' },
      { score: 1, label: 'Weak', color: '#f97316' },
      { score: 2, label: 'Fair', color: '#eab308' },
      { score: 3, label: 'Good', color: '#3b82f6' },
      { score: 4, label: 'Strong', color: '#10b981' },
      { score: 5, label: 'Very Strong', color: '#059669' }
    ];

    return strengths[score];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        if (error.message.includes('session_not_found')) {
          toast.error('Reset session expired. Please request a new reset link.');
          navigate('/forgot-password');
        } else {
          toast.error(error.message || 'Failed to update password');
        }
        return;
      }

      setIsSuccess(true);
      toast.success('Password updated successfully!');
      
      // Redirect to login after success animation
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 theme-transition"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)'
        }}
      >
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
          >
            Validating Reset Link
          </h2>
          <p 
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
          >
            Please wait while we verify your password reset request...
          </p>
        </div>
      </div>
    );
  }

  // Show error state for invalid session
  if (!isValidSession) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 theme-transition"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #ffffff 50%, #f3e8ff 100%)'
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
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 
              className="text-2xl font-bold mb-4"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
            >
              Invalid Reset Link
            </h1>
            
            <p 
              className="mb-6 leading-relaxed"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/forgot-password')}
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
                Request New Reset Link
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 font-medium transition-colors duration-200"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
                }}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 theme-transition"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)'
            : 'linear-gradient(135deg, #dcfce7 0%, #ffffff 50%, #dbeafe 100%)'
        }}
      >
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
          >
            Password Updated!
          </h1>
          <p 
            className="mb-6"
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
          >
            Your password has been successfully updated. Redirecting you to sign in...
          </p>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Main reset password form
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
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-end mb-6">
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
            >
              Set New Password
            </h1>
            <p 
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              Choose a strong password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-300 outline-none ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                    borderColor: errors.password 
                      ? '#fca5a5' 
                      : (focusedField === 'password' ? '#2563eb' : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb')),
                    color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                  }}
                  placeholder="Enter new password"
                  aria-label="New password"
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focusedField === 'password' || formData.password
                      ? '-top-2 text-xs px-2 font-medium'
                      : 'top-4'
                  }`}
                  style={{
                    backgroundColor: (focusedField === 'password' || formData.password) 
                      ? (theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb')
                      : 'transparent',
                    color: (focusedField === 'password' || formData.password)
                      ? '#2563eb'
                      : (theme === 'dark' ? 'var(--text-muted)' : '#9ca3af')
                  }}
                >
                  {focusedField === 'password' || formData.password ? 'New Password' : ''}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 transition-colors duration-200"
                  style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme === 'dark' ? 'var(--text-muted)' : '#9ca3af';
                  }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: theme === 'dark' ? 'var(--bg-tertiary)' : '#e5e7eb' }}
                    >
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <span 
                      className="text-xs font-medium"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm font-medium animate-fade-in">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl transition-all duration-300 outline-none ${
                    errors.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-300 focus:border-green-500'
                      : 'focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                    borderColor: errors.confirmPassword 
                      ? '#fca5a5' 
                      : (formData.confirmPassword && formData.password === formData.confirmPassword)
                      ? '#86efac'
                      : (focusedField === 'confirmPassword' ? '#2563eb' : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb')),
                    color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                  }}
                  placeholder="Confirm new password"
                  aria-label="Confirm new password"
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focusedField === 'confirmPassword' || formData.confirmPassword
                      ? '-top-2 text-xs px-2 font-medium'
                      : 'top-4'
                  }`}
                  style={{
                    backgroundColor: (focusedField === 'confirmPassword' || formData.confirmPassword) 
                      ? (theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb')
                      : 'transparent',
                    color: (focusedField === 'confirmPassword' || formData.confirmPassword)
                      ? '#2563eb'
                      : (theme === 'dark' ? 'var(--text-muted)' : '#9ca3af')
                  }}
                >
                  {focusedField === 'confirmPassword' || formData.confirmPassword ? 'Confirm Password' : ''}
                </label>
                <div className="absolute right-4 top-4 flex items-center space-x-2">
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="transition-colors duration-200"
                    style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af' }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? 'var(--text-secondary)' : '#6b7280';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme === 'dark' ? 'var(--text-muted)' : '#9ca3af';
                    }}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm font-medium animate-fade-in">
                  {errors.confirmPassword}
                </p>
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
                  <p className="font-medium mb-1">Password Requirements</p>
                  <ul className="space-y-1 text-xs">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Use a unique password you haven't used before</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 min-h-[3.5rem]"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p 
              className="text-sm"
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold transition-colors duration-200 hover:underline"
                style={{ color: '#2563eb' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;