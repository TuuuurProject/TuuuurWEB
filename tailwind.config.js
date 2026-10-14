/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          dark: 'rgb(var(--surface-page) / <alpha-value>)',
          darkGray: 'rgb(var(--surface-card) / <alpha-value>)',
          purple: 'rgb(var(--accent-primary) / <alpha-value>)',
          purpleDark: 'rgb(var(--accent-primary-dark) / <alpha-value>)',
          orange: 'rgb(var(--accent-coral) / <alpha-value>)',
          orangeDark: 'rgb(var(--accent-coral-dark) / <alpha-value>)',
          green: 'rgb(var(--accent-green) / <alpha-value>)',
          greenDark: 'rgb(var(--accent-green-dark) / <alpha-value>)',
          yellow: 'rgb(var(--accent-yellow) / <alpha-value>)',
          pink: 'rgb(var(--accent-pink) / <alpha-value>)',
          cyan: 'rgb(var(--accent-cyan) / <alpha-value>)',
          lightGray: 'rgb(var(--text-primary) / <alpha-value>)',
          gray: 'rgb(var(--text-muted) / <alpha-value>)',
          white: '#FFFFFF', // Blanc pur
          light: '#C37A3E',
          beige: '#F3E1C3',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        branding: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gaming: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        orbitron: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 8px 20px rgb(var(--accent-primary) / 0.15)',
        'neon-orange': '0 8px 20px rgb(var(--accent-coral) / 0.15)',
        'neon-green': '0 8px 20px rgb(var(--accent-green) / 0.15)',
        glow: '0 8px 24px rgb(var(--accent-primary) / 0.12)',
        'glow-hover': '0 12px 28px rgb(var(--accent-primary) / 0.22)',
        'glow-hover-orange': '0 12px 28px rgb(var(--accent-coral) / 0.22)',
        card: '0 12px 36px rgb(var(--shadow-color) / 0.08)',
        soft: '0 3px 6px rgba(74,46,25,0.05), 0 1px 3px rgba(74,46,25,0.03)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        glow: {
          from: { filter: 'drop-shadow(0 0 10px rgba(108, 92, 231, 0.5))' },
          to: { filter: 'drop-shadow(0 0 20px rgba(108, 92, 231, 0.8))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      transitionDuration: {
        250: '250ms',
      },
      backgroundImage: {
        'gaming-gradient': 'linear-gradient(135deg, rgb(var(--surface-page)), rgb(var(--surface-raised)))',
        'purple-gradient': 'linear-gradient(135deg, rgb(var(--accent-primary)), rgb(var(--accent-primary-dark)))',
        'orange-gradient': 'linear-gradient(135deg, rgb(var(--accent-coral)), rgb(var(--accent-coral-dark)))',
        'green-gradient': 'linear-gradient(135deg, rgb(var(--accent-green)), rgb(var(--accent-green-dark)))',
        cosmic: 'radial-gradient(ellipse at top, rgb(var(--accent-primary) / 0.07), transparent 65%)',
        'card-gradient': 'linear-gradient(145deg, rgb(var(--surface-card)), rgb(var(--surface-raised)))',
        'beige-radial':
          'radial-gradient(1200px 600px at 10% 10%, rgba(195,122,62,0.08), transparent), radial-gradient(1000px 500px at 90% 80%, rgba(107,185,77,0.10), transparent)',
      },
    },
  },
  plugins: [],
}
