import type { Config } from "tailwindcss";

/** Nonnina brand tokens – see brand/nonnina-brand-identity.html */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202128",
        graphite: "#343A46",
        muted: "#5B6474",
        line: "#E4E7EE",
        latte: "#FAF6F0",
        mist: "#F5F7FB",
        sole: { DEFAULT: "#F4B740", deep: "#8A5A00" },
        camomilla: "#FFF3E2",
        menta: "#DFF1F3",
        salvia: "#E9F3DF",
        glicine: "#E7E3FF",
        cielo: "#DDECFD",
        allarme: { DEFAULT: "#B42318", soft: "#FEF3F2" },
        bene: "#0E7A36",
        link: "#3B5BD6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
      },
      borderRadius: {
        xs: "0.5rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.25rem",
        xl: "2rem",
      },
      maxWidth: { site: "90rem" },
      boxShadow: {
        float: "0 24px 60px -24px rgba(32,33,40,.35)",
        device: "0 30px 70px -30px rgba(32,33,40,.5)",
      },
    },
  },
  plugins: [],
} satisfies Config;
