import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Eye, EyeOff, ArrowLeft, Check, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

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
      const success = await signUp(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName
      );
      
      if (success) {
        setIsSuccess(true);
        // Redirect after success animation
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const success = await signInWithGoogle();
      if (success) {
        // OAuth redirect will handle navigation
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
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
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
          >
            Account Created Successfully!
          </h1>
          <p 
            className="mb-6"
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
          >
            Welcome to FitTrack! Redirecting you to sign in...
          </p>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
            onClick={() => navigate('/')}
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
            <span className="text-sm font-medium">Back to Home</span>
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

        {/* Sign Up Card */}
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
              Create Your Account
            </h1>
            <p 
              style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
            >
              Join thousands of fitness enthusiasts
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-4 border-2 rounded-xl transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#ffffff',
              color: theme === 'dark' ? 'var(--text-primary)' : '#374151'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(37, 99, 235, 0.1)' : '#dbeafe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb';
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'var(--surface-elevated)' : '#ffffff';
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div 
                className="w-full border-t"
                style={{ borderColor: theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb' }}
              ></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-4"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
                  color: theme === 'dark' ? 'var(--text-muted)' : '#9ca3af'
                }}
              >
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 outline-none ${
                      errors.firstName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'focus:border-blue-500'
                    }`}
                    style={{
                      backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                      borderColor: errors.firstName 
                        ? '#fca5a5' 
                        : (focusedField === 'firstName' ? '#2563eb' : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb')),
                      color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                    }}
                    placeholder="First name"
                    aria-label="First name"
                  />
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focusedField === 'firstName' || formData.firstName
                        ? '-top-2 text-xs px-2 font-medium'
                        : 'top-4'
                    }`}
                    style={{
                      backgroundColor: (focusedField === 'firstName' || formData.firstName) 
                        ? (theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb')
                        : 'transparent',
                      color: (focusedField === 'firstName' || formData.firstName)
                        ? '#2563eb'
                        : (theme === 'dark' ? 'var(--text-muted)' : '#9ca3af')
                    }}
                  >
                    {focusedField === 'firstName' || formData.firstName ? 'First Name' : ''}
                  </label>
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm font-medium animate-fade-in">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 outline-none ${
                      errors.lastName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'focus:border-blue-500'
                    }`}
                    style={{
                      backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                      borderColor: errors.lastName 
                        ? '#fca5a5' 
                        : (focusedField === 'lastName' ? '#2563eb' : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb')),
                      color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                    }}
                    placeholder="Last name"
                    aria-label="Last name"
                  />
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      focusedField === 'lastName' || formData.lastName
                        ? '-top-2 text-xs px-2 font-medium'
                        : 'top-4'
                    }`}
                    style={{
                      backgroundColor: (focusedField === 'lastName' || formData.lastName) 
                        ? (theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb')
                        : 'transparent',
                      color: (focusedField === 'lastName' || formData.lastName)
                        ? '#2563eb'
                        : (theme === 'dark' ? 'var(--text-muted)' : '#9ca3af')
                    }}
                  >
                    {focusedField === 'lastName' || formData.lastName ? 'Last Name' : ''}
                  </label>
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm font-medium animate-fade-in">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full px-4 py-4 border-2 rounded-xl transition-all duration-300 outline-none ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb',
                    borderColor: errors.email 
                      ? '#fca5a5' 
                      : (focusedField === 'email' ? '#2563eb' : (theme === 'dark' ? 'var(--border-primary)' : '#e5e7eb')),
                    color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937'
                  }}
                  placeholder="Enter your email"
                  aria-label="Email address"
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    focusedField === 'email' || formData.email
                      ? '-top-2 text-xs px-2 font-medium'
                      : 'top-4'
                  }`}
                  style={{
                    backgroundColor: (focusedField === 'email' || formData.email) 
                      ? (theme === 'dark' ? 'var(--surface-elevated)' : '#f9fafb')
                      : 'transparent',
                    color: (focusedField === 'email' || formData.email)
                      ? '#2563eb'
                      : (theme === 'dark' ? 'var(--text-muted)' : '#9ca3af')
                  }}
                >
                  {focusedField === 'email' || formData.email ? 'Email Address' : ''}
                </label>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm font-medium animate-fade-in">
                  {errors.email}
                </p>
              )}
            </div>

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
                  placeholder="Create a password"
                  aria-label="Password"
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
                  {focusedField === 'password' || formData.password ? 'Password' : ''}
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
                  placeholder="Confirm your password"
                  aria-label="Confirm password"
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
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <X className="w-5 h-5 text-red-500" />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}>
              Already have an account?{' '}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;