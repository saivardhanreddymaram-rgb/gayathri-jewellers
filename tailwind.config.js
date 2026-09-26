/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand neutrals ─────────────────────────────────────────────────
        cream: {
          50:  '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#EFEFEF',
          DEFAULT: '#FFFFFF',
        },
        brown: {
          50:  '#FDF5ED',
          100: '#F5E6D0',
          200: '#E8C99A',
          400: '#A0622A',
          600: '#6B3A10',
          700: '#4A2508',
          800: '#3D1F00',
          900: '#2A1500',
          DEFAULT: '#3D1F00',
        },
        gold: {
          50:  '#FDF8EC',
          100: '#FAEDC4',
          200: '#F5D97A',
          300: '#ECC531',
          400: '#D4A010',
          500: '#C9920C',
          600: '#A87408',
          700: '#7D5405',
          DEFAULT: '#C9920C',
          accent: '#C9920C',
          light:  '#ECC531',
          btn:    '#C9920C',
        },
        // Keep ivory/espresso aliases pointing to new values for backwards compat
        ivory: {
          50:  '#FFFFFF',
          100: '#FAFAFA',
          200: '#F0F0F0',
          DEFAULT: '#FFFFFF',
        },
        espresso: {
          50:  '#FDF5ED',
          100: '#F0E0CC',
          400: '#A0622A',
          600: '#6B3A10',
          700: '#4A2508',
          800: '#3D1F00',
          900: '#2A1500',
          DEFAULT: '#3D1F00',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Lato', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':        'fadeIn 0.2s ease-in-out',
        'slide-up':       'slideUp 0.25s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'skeleton-pulse': 'skeletonPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp:      { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(100%)' },              to: { transform: 'translateX(0)' } },
        skeletonPulse:{ '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      boxShadow: {
        card:       '0 2px 12px rgba(61,31,0,0.08)',
        'card-hover':'0 8px 28px rgba(61,31,0,0.14)',
        modal:      '0 20px 60px rgba(61,31,0,0.18)',
      },
    },
  },
  plugins: [],
};
