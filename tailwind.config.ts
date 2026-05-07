import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bca: {
          'green-dark': '#1F3F2C',
          'green-light': '#9DBE6F',
          'logo-green': '#8FBE3D',
          yellow: '#F2C53D',
          orange: '#E76F4A',
          cream: '#FAF7F0',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#666666',
        },
        alert: '#C53030',
      },
      fontFamily: {
        display: ['"Bagel Fat One"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat Brush"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cta: '0 6px 0 0 rgba(0,0,0,0.15), 0 10px 24px -4px rgba(0,0,0,0.25)',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
} satisfies Config;
