/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        raiz: {
          white: '#FFFFFF',
          offwhite: '#FAF9F7',
          black: '#111111',
          dark: '#242424',

          // Brand palette
          olive: '#59614A',
          'olive-light': '#E8EBDD',

          navy: '#243447',
          'navy-light': '#E8EDF2',

          peach: '#E7A58C',
          'peach-light': '#F6E3DA',

          border: '#E5E2DF',
          secondary: '#6B6865',
        },
      },

      fontFamily: {
        serif: [
          '"Cormorant Garamond"',
          'Georgia',
          'serif',
        ],

        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      fontSize: {
        '10': ['10px', '14px'],
        '11': ['11px', '16px'],
      },

      letterSpacing: {
        widest: '0.18em',
        wider: '0.12em',
      },
    },
  },

  plugins: [],
};