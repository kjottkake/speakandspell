/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT")
module.exports = withMT({
  content: [   
     "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-gray': '#B7B7B7',
        'pygblue': '#43A1FF',
      },

      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      keyframes: {
        quiet: {
          '25%': { transform: 'scaleY(0.6)' },
          '50%': { transform: 'scaleY(0.4)' },
          '75%': { transform: 'scaleY(0.8)' },
        },
        normal: {
          '25%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.4)' },
          '75%': { transform: 'scaleY(0.6)' },
        },
        loud: {
          '25%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.4)' },
          '75%': { transform: 'scaleY(1.2)' },
        },
        record: {
          '0%': { transform: 'scale(1)'},
          '25%': { transform: 'scale(1.3)'},
          '75%': { transform: 'scale(1)'},
          '100%': { transform: 'scale(1.2)'},
        },
      },
      
      animation: {
        quiet: 'quiet 1s ease-in-out infinite',
        normal: 'normal 1s ease-in-out infinite',
        loud: 'loud 1s ease-in-out infinite',
        record: 'record 0.8s ease-in-out infinite 0.5s',
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"], // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },

});