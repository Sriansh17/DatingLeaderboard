import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-green-500',
    'bg-emerald-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'text-green-500',
    'text-emerald-500',
    'text-yellow-500',
    'text-orange-500',
    'text-red-500',
  ],
  darkMode: 'class', // kept for future use but dark class is never applied
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        gold: "rgb(var(--gold) / <alpha-value>)",
        blush: "var(--blush)",
        champagne: "rgb(var(--champagne) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        "score-low": "rgb(var(--score-low) / <alpha-value>)",
        "score-mid": "rgb(var(--score-mid) / <alpha-value>)",
        "score-high": "rgb(var(--score-high) / <alpha-value>)",
        "score-legendary": "rgb(var(--score-legendary) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        score: ['var(--font-score)', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'deep-throb': 'deep-throb 3s ease-in-out infinite',
        'diamond-glint': 'diamond-glint 3s ease-in-out infinite',
        'glass-sweep': 'glass-sweep 1.5s ease-out forwards',
        'halo-pulse': 'halo-pulse 1s ease-out forwards',
        'particle-drift': 'particle-drift 3s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-once': 'shimmer 1.5s linear forwards',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'deep-throb': {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 4px 10px rgba(var(--primary), 0.3))' },
        },
        'diamond-glint': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.5) drop-shadow(0 0 8px rgba(var(--gold), 0.6))' },
        },
        'glass-sweep': {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
          '100%': { transform: 'translateX(200%) skewX(-15deg)' },
        },
        'halo-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(var(--gold), 0.4)' },
          '100%': { boxShadow: '0 0 0 40px rgba(var(--gold), 0)' },
        },
        'particle-drift': {
          '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-40px) scale(1.2)', opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
