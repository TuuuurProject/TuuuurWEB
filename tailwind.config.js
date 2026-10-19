/** @type {import('tailwindcss').Config} */

// Les couleurs pointent vers les variables de src/assets/base.css (canaux RGB),
// ce qui permet le mode clair/sombre et garde les modificateurs d'opacité (bg-brand-purple/20).
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
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
          dark: token('bg'), // Fond de page
          darkGray: token('surface'), // Cartes, champs
          surface2: token('surface-2'), // Surfaces secondaires, pistes de slider
          line: token('line'), // Bordures neutres
          lightGray: token('ink'), // Texte principal
          gray: token('muted'), // Texte secondaire
          purple: token('primary'), // Marque, action principale
          purpleDark: token('primary-strong'),
          orange: token('orange'), // Action secondaire, mauvaise réponse
          orangeDark: token('orange'),
          onOrange: token('on-orange'), // Texte sur fond orange
          green: token('green'), // Bonne réponse, progression
          greenDark: token('green'),
          yellow: token('yellow'), // Récompenses, score
          pink: token('pink'),
          cyan: token('cyan'),
          red: token('red'),
          white: '#FFFFFF',
          // Anciennes couleurs (composants inutilisés uniquement)
          light: '#C37A3E',
          beige: '#F3E1C3',
        },
        diff: {
          easy: token('diff-easy'),
          medium: token('diff-medium'),
          hard: token('diff-hard'),
          hardcore: token('diff-hardcore'),
        },
      },
      fontFamily: {
        // Baloo 2 pour titres, boutons, branding
        display: ['Baloo 2', 'system-ui', 'sans-serif'],
        branding: ['Baloo 2', 'system-ui', 'sans-serif'],
        // Nunito pour corps de texte, quiz, menus
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        soft: 'var(--shadow-soft)',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
