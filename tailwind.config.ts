import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#111111',
        panel: '#1a1a1a',
        panelHover: '#222222',
        ink: '#f4f1ea',
        muted: '#9a948c',
        line: 'rgba(244, 241, 234, 0.16)',
        gold: '#b89b5e',
        goldLight: '#d4b87a',
        goldDark: '#9a7d4a',
        red: '#c8102e',
        redHover: '#a30e26',
        green: '#16a34a',
        blue: '#2563eb'
      },
      fontFamily: {
        sans: ['Archivo Narrow', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)'
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-in'
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(184, 155, 94, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(184, 155, 94, 0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};

export default config;