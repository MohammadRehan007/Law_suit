export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 50px rgba(15, 23, 42, 0.08)',
      },
      colors: {
        surface: '#F7F9FC',
        panel: '#FFFFFF',
        accent: '#2563EB',
        accentSoft: '#EFF6FF',
      },
    },
  },
  plugins: [],
}
