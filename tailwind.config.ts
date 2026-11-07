import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Nonnina brand tokens – source of truth: website repo `brand/nonnina-brand-identity.html`.
 * Semantic shadcn-style names (background, primary, …) are mapped onto the brand palette so
 * the UI primitives keep working; brand names (ink, latte, sole, …) are available directly.
 */
export default {
  darkMode: ["class"],
  content: ["./components/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Manrope", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Bricolage Grotesque", "Arial Narrow", "sans-serif"],
      },
      colors: {
        // brand
        ink: "#202128",
        graphite: "#343A46",
        muted: { DEFAULT: "#5B6474", foreground: "#5B6474" },
        line: "#E4E7EE",
        paper: "#FFFFFF",
        latte: "#FAF6F0",
        mist: "#F5F7FB",
        sole: { DEFAULT: "#F4B740", deep: "#8A5A00" },
        camomilla: "#FFF3E2",
        menta: "#DFF1F3",
        salvia: "#E9F3DF",
        glicine: "#E7E3FF",
        cielo: "#DDECFD",
        allarme: { DEFAULT: "#B42318", soft: "#FEF3F2", deep: "#7A1710" },
        bene: { DEFAULT: "#0E7A36", soft: "#E9F3DF" },
        link: "#3B5BD6",
        // semantic (used by ui primitives)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        "3xl": "2.5rem",
        "2xl": "2rem",
        xl: "1.25rem",
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xs: "0.5rem",
        pill: "333px",
      },
      maxWidth: { site: "90rem" },
      boxShadow: {
        soft: "0 10px 30px -14px rgba(32,33,40,.18)",
        float: "0 24px 60px -24px rgba(32,33,40,.35)",
        device: "0 30px 70px -30px rgba(32,33,40,.5)",
        glow: "0 0 0 10px rgba(244,183,64,.25), 0 24px 60px -24px rgba(32,33,40,.45)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.45" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { transform: "scale(1) rotate(0)", opacity: "1" },
          "50%": { transform: "scale(.82) rotate(12deg)", opacity: ".75" },
        },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(.22,1,.36,1) both",
        twinkle: "twinkle 3.2s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
