import React from 'react';
import { Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marathon Runner',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    quote: 'FitTrack has completely transformed how I approach my training. The analytics help me optimize every workout and prevent injuries.'
  },
  {
    name: 'Mike Chen',
    role: 'Personal Trainer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    quote: "I recommend FitTrack to all my clients. It's intuitive, comprehensive, and keeps them motivated between sessions."
  },
  {
    name: 'Emma Davis',
    role: 'Yoga Instructor',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    quote: 'The mindfulness and recovery tracking features are incredible. My students love how it complements their practice.'
  },
  {
    name: 'David Wilson',
    role: 'Weightlifting Enthusiast',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    quote: 'Finally, an app that understands serious lifting. The form analysis and progression tracking are game-changers.'
  },
  {
    name: 'Lisa Rodriguez',
    role: 'Busy Professional',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5,
    quote: 'With my hectic schedule, FitTrack helps me stay consistent. Quick workouts and smart reminders fit perfectly into my day.'
  }
];

const Testimonials: React.FC = () => {
  const { theme } = useTheme();

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section 
      id="testimonials" 
      className="py-20 lg:py-24"
      style={{ backgroundColor: theme === 'dark' ? 'var(--bg-secondary)' : '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-16 lg:mb-20">
          <h2 
            className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 lg:mb-8"
            style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
          >
            Loved by
            <br />
            <span className="text-blue-600">Fitness Enthusiasts</span>
          </h2>
          <p 
            className="text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#6b7280' }}
          >
            Join thousands of users who have transformed their fitness journey with FitTrack.
            Here's what they have to say about their experience.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 xl:gap-12">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div
              key={index}
              className="p-8 xl:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border group hover:scale-105"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
                borderColor: theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6',
                boxShadow: theme === 'dark' ? 'var(--shadow-lg)' : '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = theme === 'dark' 
                  ? '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 99, 235, 0.2)'
                  : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 20px rgba(37, 99, 235, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6';
                e.currentTarget.style.boxShadow = theme === 'dark' ? 'var(--shadow-lg)' : '0 10px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-center mb-6 lg:mb-8">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover mr-4 lg:mr-5 shadow-lg ring-2 ring-blue-500 ring-opacity-20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white status-online"></div>
                </div>
                <div>
                  <h4 
                    className="font-semibold lg:text-lg"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                  >
                    {testimonial.name}
                  </h4>
                  <p 
                    className="text-sm lg:text-base"
                    style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-4 lg:mb-6">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote 
                className="italic leading-relaxed lg:text-lg"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
              >
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Stack */}
        <div className="lg:hidden space-y-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-lg border mx-2 transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
                borderColor: theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6'
              }}
            >
              <div className="flex items-start mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0 shadow-lg"
                />
                <div className="min-w-0 flex-1">
                  <h4 
                    className="font-semibold text-base truncate"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                  >
                    {testimonial.name}
                  </h4>
                  <p 
                    className="text-sm truncate"
                    style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote 
                className="italic text-sm leading-relaxed"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
              >
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Additional testimonials for desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 mt-8 xl:mt-12">
          {testimonials.slice(3, 5).map((testimonial, index) => (
            <div
              key={index + 3}
              className="p-8 xl:p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border group hover:scale-105"
              style={{
                backgroundColor: theme === 'dark' ? 'var(--surface)' : '#ffffff',
                borderColor: theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6',
                boxShadow: theme === 'dark' ? 'var(--shadow-lg)' : '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.boxShadow = theme === 'dark' 
                  ? '0 25px 50px rgba(0, 0, 0, 0.3), 0 0 20px rgba(37, 99, 235, 0.2)'
                  : '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 20px rgba(37, 99, 235, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--border-primary)' : '#f3f4f6';
                e.currentTarget.style.boxShadow = theme === 'dark' ? 'var(--shadow-lg)' : '0 10px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className="flex items-center mb-6 lg:mb-8">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 lg:w-16 lg:h-16 rounded-full object-cover mr-4 lg:mr-5 shadow-lg ring-2 ring-blue-500 ring-opacity-20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white status-online"></div>
                </div>
                <div>
                  <h4 
                    className="font-semibold lg:text-lg"
                    style={{ color: theme === 'dark' ? 'var(--text-primary)' : '#1f2937' }}
                  >
                    {testimonial.name}
                  </h4>
                  <p 
                    className="text-sm lg:text-base"
                    style={{ color: theme === 'dark' ? 'var(--text-tertiary)' : '#6b7280' }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-4 lg:mb-6">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote 
                className="italic leading-relaxed lg:text-lg"
                style={{ color: theme === 'dark' ? 'var(--text-secondary)' : '#374151' }}
              >
                "{testimonial.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;