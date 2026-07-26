"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ✅ Lazy initialization - read localStorage once at mount
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"; // SSR safety
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return "dark";
  });

  // ✅ KEEP this effect - synchronizes state to external systems
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
