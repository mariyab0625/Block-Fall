/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Press Start 2P"', 'monospace'],
        body:    ['Orbitron', 'sans-serif'],
        ui:      ['Rajdhani', 'sans-serif'],
      },
      colors: {
        'neon-cyan':    '#00f5ff',
        'neon-magenta': '#ff00aa',
        'neon-yellow':  '#f5e642',
        'neon-green':   '#39ff14',
        'neon-purple':  '#bf5fff',
        'neon-orange':  '#ff8800',
        'neon-red':     '#ff4d4d',
        'bg-primary':   '#0a0a0f',
        'bg-secondary': '#0d0d1a',
        'bg-card':      '#111122',
      },
      boxShadow: {
        'neon-cyan':    '0 0 8px #00f5ff, 0 0 20px #00f5ff',
        'neon-magenta': '0 0 8px #ff00aa, 0 0 20px #ff00aa',
        'neon-green':   '0 0 8px #39ff14, 0 0 20px #39ff14',
        'neon-yellow':  '0 0 8px #f5e642, 0 0 20px #f5e642',
        'neon-purple':  '0 0 8px #bf5fff, 0 0 20px #bf5fff',
      },
      keyframes: {
        blink:     { '0%,49%': { opacity: 1 }, '50%,100%': { opacity: 0 } },
        neonPulse: {
          '0%,100%': { textShadow: '0 0 10px #00f5ff, 0 0 30px #00f5ff' },
          '50%':     { textShadow: '0 0 20px #00f5ff, 0 0 60px #00f5ff, 0 0 10px #ff00aa' },
        },
        fadeInUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        rowFlash:  {
          '0%':   { background: 'white' },
          '40%':  { background: '#00f5ff' },
          '100%': { transform: 'scaleY(0)', opacity: 0 },
        },
        gridScroll: { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '0 60px' } },
        blockFall:  { from: { transform: 'translateY(-120px)', opacity: 0.12 }, to: { transform: 'translateY(110vh)', opacity: 0 } },
      },
      animation: {
        blink:      'blink 1s step-end infinite',
        neonPulse:  'neonPulse 2.5s ease-in-out infinite',
        fadeInUp:   'fadeInUp 0.6s ease forwards',
        rowFlash:   'rowFlash 0.5s ease-out forwards',
        gridScroll: 'gridScroll 4s linear infinite',
        blockFall:  'blockFall linear infinite',
      },
    },
  },
  plugins: [],
};
