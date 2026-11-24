/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: deep manuscript teal
        primary: {
          50: '#f0f9f7',
          100: '#d9efe9',
          200: '#b5dfd5',
          300: '#85c7ba',
          400: '#55a99b',
          500: '#358d80',
          600: '#277166',
          700: '#215b54',
          800: '#1d4943',
          900: '#193c38',
          950: '#0c201e',
        },
        // Accent: illuminated gold
        accent: {
          50: '#fbf8eb',
          100: '#f6eecb',
          200: '#eeda96',
          300: '#e3c05b',
          400: '#dba839',
          500: '#c98f22',
          600: '#ab6e1a',
          700: '#8a5118',
          800: '#73411a',
          900: '#62361a',
          950: '#391a09',
        },
        // Secondary: warm parchment / clay
        secondary: {
          50: '#faf7f2',
          100: '#f3ece1',
          200: '#e5d7c1',
          300: '#d3bb9b',
          400: '#bf9c76',
          500: '#b28760',
          600: '#a3704f',
          700: '#885842',
          800: '#704839',
          900: '#5c3c31',
          950: '#311e18',
        },
        neutral: {
          0: '#ffffff',
          50: '#f7f6f4',
          100: '#edeae5',
          200: '#dcd7cf',
          300: '#c2bbae',
          400: '#a29a8a',
          500: '#888072',
          600: '#6f675b',
          700: '#5b544b',
          800: '#4b463f',
          900: '#3d3934',
          950: '#292622',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        urdu: ['"Gulzar"', '"Noto Nastaliq Urdu"', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Marcellus"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'parchment': "linear-gradient(160deg, #faf7f2 0%, #f3ece1 50%, #efe4d2 100%)",
        'hero-ink': "linear-gradient(180deg, #0c201e 0%, #193c38 60%, #1d4943 100%)",
      },
      boxShadow: {
        'card': '0 1px 2px rgba(41,38,34,0.06), 0 8px 24px rgba(41,38,34,0.07)',
        'card-hover': '0 2px 4px rgba(41,38,34,0.08), 0 16px 40px rgba(41,38,34,0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
