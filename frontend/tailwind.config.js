/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme tokens specified in design system
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          primary: '#4F46E5',
          'primary-hover': '#4338CA',
          text: '#0F172A',
          secondary: '#64748B',
          border: '#E2E8F0',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#F43F5E'
        },
        dark: {
          bg: '#0B1120',
          card: '#111827',
          surface: '#172033',
          primary: '#818CF8',
          text: '#F1F5F9',
          secondary: '#94A3B8',
          border: '#263449'
        },
        // Existing tokens preserved for backward compatibility
        bg: '#0b1020',
        surface: '#111827',
        card: '#171f2e',
        ink: '#f8fafc',
        muted: '#94a3b8',
        match: '#4f46e5',
        match2: '#818cf8',
        coral: '#f43f5e',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        border: '#2a374b'
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        glow: '0 0 20px rgba(79, 70, 229, 0.18)'
      },
      fontFamily: {
        display: ['Inter', '"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
