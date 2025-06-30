/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'serif'],
        geistMono: ['Geist Mono', 'serif'],
      },
      colors: {
        primary: '#3BE2BE',
        muted: '#FFFFFF66',
        lightWhite: '#FFFFFF0D',
        borderWhite: '#FFFFFF05',
        danger: '#E23B3E',
        white: '#FFFFFF',
        black: '#0C0C0C',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
