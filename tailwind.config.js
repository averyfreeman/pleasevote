module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './Components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
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
