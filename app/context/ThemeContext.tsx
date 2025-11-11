import React, { createContext, ReactNode, useContext, useState } from "react";
import { darkTheme, lightTheme, Theme, ThemeMode } from "../constants/theme";

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>("light"); // Padrão: modo claro
    
    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };
    
    const toggleTheme = () => {
        setThemeMode(themeMode === "light" ? "dark" : "light");
    };
    
    const theme = themeMode === "light" ? lightTheme : darkTheme;
    
    return (
        <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
    }
    return context;
}

