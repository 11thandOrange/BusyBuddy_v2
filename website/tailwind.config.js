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
        background: {
          DEFAULT: '#FBF7F0',
          elevated: '#F3EDE0',
        },
        surface: {
          DEFAULT: 'rgba(31, 36, 48, 0.03)',
          hover: 'rgba(31, 36, 48, 0.05)',
          active: 'rgba(31, 36, 48, 0.08)',
          border: 'rgba(31, 36, 48, 0.1)',
          'border-hover': 'rgba(31, 36, 48, 0.18)',
        },
        content: {
          DEFAULT: '#1F2430',
          secondary: '#5B6472',
          muted: '#8B93A1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        container: '1200px',
        'container-lg': '1400px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0, 0, 0, 0.2)',
        button: '0 4px 16px rgba(81, 105, 221, 0.25)',
      },
    },
  },
  plugins: [],
};
