/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FFF5F0",
          100: "#FFE4D6",
          200: "#FFC4A3",
          300: "#FF9E6B",
          400: "#FF7A3D",
          500: "#FF5722", // main orange
          600: "#E64100",
          700: "#B33300",
          800: "#802400",
          900: "#4D1600",
        },
        accent: {
          pink:   "#FF4D8D",
          yellow: "#FFD23F",
          green:  "#4ECB71",
          purple: "#9D4EDD",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #FF5722 0%, #FF4D8D 50%, #FFD23F 100%)",
        "gradient-card": "linear-gradient(135deg, #FFF5F0 0%, #FFE4D6 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-slow": "bounce 3s infinite",
        "float": "float 4s ease-in-out infinite",
        "wiggle": "wiggle 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%":      { transform: "rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
