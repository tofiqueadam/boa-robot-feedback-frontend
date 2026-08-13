/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Bank of Abyssinia official brand ─────────────────────────────
        paper:           "#F6F5F0",   // warm off-white
        "paper-2":       "#FFFFFF",
        ink:             "#111111",   // BoA near-black (logo/sidebar bg)
        "ink-soft":      "#555555",
        gold:            "#E8A020",   // BoA amber-gold (Adey Abeba flower)
        "gold-deep":     "#B87C10",
        "gold-soft":     "#FDF0D0",
        positive:        "#1A6B3C",
        "positive-soft": "#D4EDE0",
        attention:       "#C0392B",
        "attention-soft":"#FEE2E2",
        line:            "#E2E2DC",
        "line-strong":   "#C8C8BF",
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      borderRadius: { card: "14px" },
      boxShadow: {
        card: "0 1px 3px rgba(17,17,17,0.06), 0 8px 24px rgba(17,17,17,0.09)",
      },
    },
  },
  plugins: [],
};
