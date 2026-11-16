import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1B4D3E', light: '#2D7D68', dark: '#143D31', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#C8A951', light: '#D4BC72', dark: '#A88B3A', foreground: '#143D31' },
        accent: '#2D7D68',
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        foreground: 'hsl(var(--foreground))',
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--border))',
        ring: '#2D7D68',
        destructive: { DEFAULT: '#B42318', foreground: '#FFFFFF' },
        popover: { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--foreground))' },
        card: { DEFAULT: 'hsl(var(--surface))', foreground: 'hsl(var(--foreground))' },
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: { lg: '0.75rem', xl: '1rem', '2xl': '1.5rem' },
      boxShadow: { soft: '0 8px 40px -12px rgb(27 77 62 / 0.12)' },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { 'fade-in': 'fade-in 0.4s ease-out' },
    },
  },
  plugins: [animate],
};
export default config;
