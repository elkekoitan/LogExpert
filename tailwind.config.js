/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LogExpert Brand Colors (Dark Mode Primary)
        primary: {
          50: '#f0f0ff',
          100: '#e5e5ff',
          200: '#d0d0ff',
          300: '#b0b0ff',
          400: '#8b7eff',
          500: '#6a5af9',
          600: '#5a47f0',
          700: '#4c39dc',
          800: '#3f2fb8',
          900: '#362a95',
          950: '#1e1a5a',
        },
        // Background Colors
        background: {
          primary: '#1E2139',
          secondary: '#2D3155',
          tertiary: '#121420',
          light: '#FFFFFF',
          'light-secondary': '#F8FAFC',
        },
        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A3BD',
          muted: '#6B7280',
          'primary-light': '#1F2937',
          'secondary-light': '#6B7280',
        },
        // Status Colors
        status: {
          success: '#00C48C',
          error: '#FF4D4D',
          warning: '#F59E0B',
          info: '#3B82F6',
          triggered: '#EF4444',
          acknowledged: '#F59E0B',
          resolved: '#10B981',
        },
        // Severity Colors
        severity: {
          p1: '#EF4444',
          p2: '#F59E0B',
          p3: '#3B82F6',
          p4: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
