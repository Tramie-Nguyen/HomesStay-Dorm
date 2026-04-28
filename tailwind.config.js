export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        base: "var(--color-base)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        grey: "var(--color-grey)",

        text1: "var(--color-text1)",
        text2: "var(--color-text2)",
      },
    },
  },
  plugins: [],
};
