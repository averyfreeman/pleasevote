module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './Components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
      },
      fontFamily: {
        righteous: ['Righteous', 'cursive'],
        mono: ['Space Mono', 'monospace'],
        vt323: ['VT323', 'monospace'],
      },
      colors: {
        onehalf: {
          dark: '#282c34',
          light: '#dcdfe4',
          red: '#e06c75',
          green: '#98c379',
          yellow: '#e5c07b',
          blue: '#61afef',
          magenta: '#c678dd',
          cyan: '#56b6c2',
          gray: '#5c6370',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
