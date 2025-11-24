import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        horse: '#2d5a27',    // 경마 그린
        cycle: '#dc2626',    // 경륜 레드
        boat: '#0369a1',     // 경정 블루
      },
    },
  },
  plugins: [],
}
export default config
