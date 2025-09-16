/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Couleurs gaming vibrantes
          dark: '#0A0B1E', // Bleu très sombre pour le fond
          darkGray: '#1A1B2E', // Gris sombre pour les cartes
          purple: '#6C5CE7', // Violet électrique principal
          purpleDark: '#5A4FCF', // Violet plus sombre
          orange: '#FF6B35', // Orange énergique
          orangeDark: '#E55A2B', // Orange plus sombre
          green: '#00D084', // Vert néon
          greenDark: '#00B56F', // Vert plus sombre
          yellow: '#FFD93D', // Jaune vif pour les accents
          pink: '#FF4081', // Rose vif pour les éléments spéciaux
          cyan: '#00E5FF', // Cyan pour les liens/info
          lightGray: '#E1E5E9', // Texte clair
          gray: '#8B9AA8', // Texte secondaire
          white: '#FFFFFF', // Blanc pur
          // Anciennes couleurs pour compatibilité
          light: '#C37A3E',
          beige: '#F3E1C3',
        },
      },
      fontFamily: {
        // Baloo 2 pour titres, boutons, branding
        display: ['Baloo 2', 'cursive', 'system-ui', 'sans-serif'],
        branding: ['Baloo 2', 'cursive', 'system-ui', 'sans-serif'],
        // Nunito pour corps de texte, quiz, menus
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Polices gaming pour éléments spéciaux
        gaming: ['"Press Start 2P"', 'cursive', 'monospace'],
        orbitron: ['Orbitron', 'cursive', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(108, 92, 231, 0.5), 0 0 40px rgba(108, 92, 231, 0.3)',
        'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        'neon-green': '0 0 20px rgba(0, 208, 132, 0.5), 0 0 40px rgba(0, 208, 132, 0.3)',
        glow: '0 0 30px rgba(108, 92, 231, 0.4)',
        'glow-hover': '0 0 40px rgba(108, 92, 231, 0.6), 0 0 60px rgba(108, 92, 231, 0.4)',
        card: '0 8px 32px rgba(10, 11, 30, 0.3), 0 4px 16px rgba(10, 11, 30, 0.2)',
        soft: '0 12px 24px rgba(74,46,25,0.14), 0 6px 12px rgba(74,46,25,0.08)',
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
        'gaming-gradient': 'linear-gradient(135deg, #0A0B1E 0%, #1A1B2E 50%, #0A0B1E 100%)',
        'purple-gradient': 'linear-gradient(135deg, #6C5CE7 0%, #5A4FCF 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
        'green-gradient': 'linear-gradient(135deg, #00D084 0%, #00B56F 100%)',
        cosmic:
          'radial-gradient(ellipse at top, rgba(108, 92, 231, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
        'card-gradient':
          'linear-gradient(145deg, rgba(26, 27, 46, 0.8) 0%, rgba(10, 11, 30, 0.9) 100%)',
        'beige-radial':
          'radial-gradient(1200px 600px at 10% 10%, rgba(195,122,62,0.08), transparent), radial-gradient(1000px 500px at 90% 80%, rgba(107,185,77,0.10), transparent)',
      },
    },
  },
  plugins: [],
}
