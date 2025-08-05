import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      colors: {
        primary: {
          50: '#EEFBF2',
          100: '#D6F5DE',
          200: '#B0EAC2',
          300: '#7DD8A0',
          400: '#47C07A',
          500: '#24A55E',
          600: '#17844A',
          700: '#126A3E',
          800: '#115432',
          900: '#0E4229',
          950: '#072718'
        },
        secondary: {
          50: '#F5F9EC',
          100: '#E8F1D6',
          200: '#C6DC9A',
          300: '#B6D284',
          400: '#9ABE5D',
          500: '#7CA33F',
          600: '#60812F',
          700: '#4B6328',
          800: '#3E5024',
          900: '#364522',
          950: '#1A250E'
        }
      }
    }
  },
  plugins: [heroui()],
  darkMode: 'class'
};
export default config;
