import * as React from 'react';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import defaultTheme from './theme';
import { themeState, darkModeHook } from './types';

const defaultContexData = {
  dark: false,
  toggle: () => {}
};
const ThemeContext = React.createContext<typeof defaultContexData>(
  defaultContexData
);
const useThemeToggler = () => React.useContext(ThemeContext);

const initialThemeState = {
  dark: false,
  hasThemeMounted: false
};

const useEffectDarkMode: darkModeHook = () => {
  const [themeState, setThemeState] = React.useState<themeState>(
    initialThemeState
  );
  React.useEffect(() => {
    const isDark = localStorage.getItem('themeDarkMode') === 'true';
    setThemeState({ ...themeState, dark: isDark, hasThemeMounted: true });
  }, []);
  return [themeState, setThemeState];
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeState, setThemeState] = useEffectDarkMode();
  if (!themeState.hasThemeMounted) {
    return <div />;
  }
  const toggle = () => {
    const themeDarkMode = !themeState.dark;
    localStorage.setItem('themeDarkMode', JSON.stringify(themeDarkMode));
    setThemeState({ ...themeState, dark: themeDarkMode });
  };
  const computedTheme = themeState.dark
    ? defaultTheme('dark')
    : defaultTheme('light');

  const value = {
    dark: themeState.dark,
    toggle: toggle
  };
  return (
    <EmotionThemeProvider theme={computedTheme}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </EmotionThemeProvider>
  );
};

export { ThemeProvider, useThemeToggler };
