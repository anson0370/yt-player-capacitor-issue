/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    supports: {
      dvh: "height: 100dvh",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "jump": {
          "0%, 5%, 10%, 100%": { transform: "translateY(0)" },
          "2.5%, 7.5%": { transform: "translateY(-20%)" },
        },
        "scrollX": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-cozy": "spin 2.5s linear infinite",
        "spin-slow": "spin 4s linear infinite",
        "jump": "jump 3s linear infinite",
        "text-scroll": "scrollX 10s linear infinite",
      },
      fontFamily: {
        'sans': ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        'mono': ['var(--font-roboto-mono)', ...defaultTheme.fontFamily.mono],
        'serif': ['var(--font-dm-serif-display)', ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
    plugin(({ addVariant }) => {
      addVariant('touchable', [
        '@media (pointer: coarse)',
      ]);
      addVariant('chover', [
        '@media (hover: hover) and (pointer: fine) { &:hover }',
        '&[data-click-hover="active"]',
      ]);
      addVariant('group-chover', [
        '@media (hover: hover) and (pointer: fine) { :merge(.group):hover & }',
        ':merge(.group)[data-click-hover="active"] &',
      ]);
    }),
  ],
}
