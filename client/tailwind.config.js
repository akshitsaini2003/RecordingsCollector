/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12343b",
        mist: "#f5f1e8",
        sage: "#d7e6d4",
        reef: "#1f7a8c",
        ember: "#b85c38",
        sand: "#f7ebd6"
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Source Sans 3"', "sans-serif"]
      },
      boxShadow: {
        panel: "0 20px 60px rgba(18, 52, 59, 0.14)"
      }
    }
  },
  plugins: []
};
