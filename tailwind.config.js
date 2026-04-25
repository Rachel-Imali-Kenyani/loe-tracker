/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed-variant": "#394d00",
        "on-secondary": "#263500",
        "secondary": "#add44f",
        "on-background": "#dee4e2",
        "surface-container-high": "#252b2b",
        "surface-tint": "#00d4b6",
        "surface-container": "#1b2120",
        "on-primary-fixed-variant": "#00504e",
        "surface-container-lowest": "#090f0f",
        "on-error": "#690005",
        "on-secondary-fixed": "#151f00",
        "surface-variant": "#303635",
        "secondary-container": "#799d19",
        "on-tertiary-fixed": "#002022",
        "outline-variant": "#3d4948",
        "on-secondary-container": "#212e00",
        "primary-fixed-dim": "#00d4b6",
        "on-primary-container": "#00302f",
        "inverse-primary": "#006a68",
        "background": "#0f1414",
        "error-container": "#93000a",
        "primary-container": "#00a29f",
        "on-surface-variant": "#bcc9c8",
        "on-surface": "#dee4e2",
        "on-primary-fixed": "#00201f",
        "tertiary-container": "#5a9ba0",
        "secondary-fixed-dim": "#add44f",
        "outline": "#869392",
        "error": "#ffb4ab",
        "on-error-container": "#ffdad6",
        "surface-container-low": "#171d1c",
        "primary": "#00d4b6",
        "surface-container-highest": "#303635",
        "on-tertiary-fixed-variant": "#004f54",
        "surface-dim": "#0f1414",
        "inverse-on-surface": "#2c3231",
        "surface-bright": "#343a3a",
        "tertiary": "#90d1d7",
        "on-tertiary-container": "#002f32",
        "inverse-surface": "#dee4e2",
        "primary-fixed": "#7df5f1",
        "tertiary-fixed-dim": "#90d1d7",
        "on-tertiary": "#00363a",
        "on-primary": "#003736",
        "secondary-fixed": "#c8f168",
        "tertiary-fixed": "#aceef3",
        "surface": "#0f1414"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "lg": "2rem",
        "gutter": "1rem",
        "md": "1.5rem",
        "sm": "1rem",
        "xl": "3rem",
        "base": "4px",
        "margin": "1.5rem",
        "xs": "0.5rem"
      },
      fontFamily: {
        "headline-md": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "data-mono": ["Roboto Mono", "monospace"],
        "body-base": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "label-caps": ["12px", {"lineHeight": "1.2", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "data-mono": ["14px", {"lineHeight": "1.4", "letterSpacing": "-0.01em", "fontWeight": "500"}],
        "body-base": ["16px", {"lineHeight": "1.5", "letterSpacing": "0em", "fontWeight": "400"}],
        "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
