/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5169DD',
          hover: '#4257c4',
          dark: '#3a4bb0',
          muted: 'rgba(81, 105, 221, 0.1)',
        },
        app: {
          orange: '#e67e00',
          indigo: '#5856d6',
          blue: '#007aff',
          green: '#34c759',
          pink: '#ff2d55',
          purple: '#af52de',
        },
        background: {
          DEFAULT: '#0f1117',
          elevated: '#1a1d27',
          overlay: 'rgba(0, 0, 0, 0.5)',
        },
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          hover: 'rgba(255, 255, 255, 0.06)',
          active: 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.15)',
        },
        content: {
          DEFAULT: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        status: {
          success: '#34c759',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#5169DD',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      maxWidth: {
        container: '1200px',
        'container-lg': '1400px',
        content: '760px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.2)',
        button: '0 4px 16px rgba(81, 105, 221, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #5169DD 0%, #3a4bb0 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(81,105,221,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
