module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-40%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(60%)' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

