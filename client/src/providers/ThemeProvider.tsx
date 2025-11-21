import { createContext, useState, useMemo, useContext } from "react";
import type { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";

interface ThemeModeContextType {
  mode: PaletteMode;
  setMode: React.Dispatch<React.SetStateAction<PaletteMode>>;
}

const ThemeModeContext = createContext<ThemeModeContextType | null>(null);

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used inside an AppThemeProvider");
  }
  return ctx;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 10 },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
