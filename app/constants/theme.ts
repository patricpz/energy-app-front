export type ThemeMode = "light" | "dark";

export const lightTheme = {
    mode: "light" as ThemeMode,
    colors: {
        // Backgrounds
        background: "#FFFFFF",
        surface: "#F5F7FA",
        card: "#FFFFFF",
        header: "#FFFFFF",
        
        // Text
        text: "#1F2937",
        textSecondary: "#6B7280",
        textTertiary: "#9CA3AF",
        
        // Primary (Azul no lugar do verde)
        primary: "#2563EB", // Azul principal
        primaryLight: "#3B82F6",
        primaryDark: "#1E40AF",
        primaryBackground: "#DBEAFE",
        
        // Borders and dividers
        border: "#E5E7EB",
        divider: "#E5E7EB",
        
        // Status
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        
        // Tab bar
        tabBarBackground: "#FFFFFF",
        tabBarActive: "#2563EB",
        tabBarInactive: "#9CA3AF",
        
        // Progress bar
        progressBackground: "#E5E7EB",
        progressFill: "#2563EB",
        
        // Switch
        switchActive: "#2563EB",
        switchInactive: "#D1D5DB",
        
        // Button
        buttonPrimary: "#2563EB",
        buttonText: "#FFFFFF",
    },
};

export const darkTheme = {
    mode: "dark" as ThemeMode,
    colors: {
        // Backgrounds
        background: "#0F172A",
        surface: "#1E293B",
        card: "#1E293B",
        header: "#0F172A",
        
        // Text
        text: "#FFFFFF",
        textSecondary: "#94A3B8",
        textTertiary: "#64748B",
        
        // Primary (Azul no lugar do verde)
        primary: "#3B82F6", // Azul mais claro para modo escuro
        primaryLight: "#60A5FA",
        primaryDark: "#2563EB",
        primaryBackground: "#1E3A8A",
        
        // Borders and dividers
        border: "#334155",
        divider: "#334155",
        
        // Status
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        
        // Tab bar
        tabBarBackground: "#111827",
        tabBarActive: "#3B82F6",
        tabBarInactive: "#757575",
        
        // Progress bar
        progressBackground: "#334155",
        progressFill: "#3B82F6",
        
        // Switch
        switchActive: "#3B82F6",
        switchInactive: "#374151",
        
        // Button
        buttonPrimary: "#1E40AF",
        buttonText: "#FFFFFF",
    },
};

export type Theme = typeof lightTheme;

