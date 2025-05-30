import { createTheme } from "@vanilla-extract/css";

export const [layoutClass, layoutVars] = createTheme({
  color: {
    background: "#ffffff",
    foreground: "#000000",
    border: "#e5e7eb",
    primary: "#1677ff",
    secondary: "#f5f5f5"
  },
  space: {
    small: "8px",
    medium: "16px",
    large: "24px"
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px"
  }
});
