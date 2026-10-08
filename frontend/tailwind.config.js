/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b1020',
        surface: '#111827',
        card: '#171f2e',
        ink: '#f8fafc',
        muted: '#94a3b8',
        match: '#f87171',
        match2: '#fb7185',
        coral: '#f87171',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        border: '#2a374b'
      },
      backgroundImage: {
        sky: 'radial-gradient(at 85% 0%, rgba(248,113,113,0.14) 0px, transparent 28%), linear-gradient(180deg, #0b1020 0%, #0f172a 100%)',
        'grid-pattern': 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.35)',
        glow: '0 0 20px rgba(248, 113, 113, 0.18)'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
