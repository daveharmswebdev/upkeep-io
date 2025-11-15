/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#FFABA4',
          200: '#D46764',
          300: '#AD3A37',
          400: '#861916',
          500: '#5A0200',
        },
        'secondary-1': {
          100: '#FFCEA4',
          200: '#D49864',
          300: '#AD6E37',
          400: '#864A16',
          500: '#5A2A00',
        },
        'secondary-2': {
          100: '#63979A',
          200: '#3D7D80',
          300: '#226569',
          400: '#0E4E51',
          500: '#003436',
        },
        complement: {
          100: '#81C885',
          200: '#4FA755',
          300: '#2B8831',
          400: '#116917',
          500: '#004705',
        },
      },
      fontFamily: {
        sans: ['Lato', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
