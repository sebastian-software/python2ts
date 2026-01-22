import starlightPlugin from "@astrojs/starlight-tailwind"

const accent = {
  200: "#a8d5ba",
  600: "#2e8555",
  900: "#1a4d31",
  950: "#143d27"
}

const gray = {
  100: "#f5f6f8",
  200: "#eceef2",
  300: "#c0c2c7",
  400: "#888b96",
  500: "#545861",
  700: "#353841",
  800: "#24272e",
  900: "#17191e"
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        accent,
        gray
      }
    }
  },
  plugins: [starlightPlugin()]
}
