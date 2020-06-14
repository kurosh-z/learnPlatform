import * as React from 'react'
import {
    ThemeProvider as EmotionThemeProvider,
    useTheme as EmoUsetheme,
} from 'emotion-theming'
import defaultTheme from './theme'

import { ThemeState, DarkModeHook, Theme } from './types'

const defaultContexData = {
    dark: false,
    toggle: () => {},
}
const ThemeContext = React.createContext<typeof defaultContexData>(
    defaultContexData
)
const useThemeToggler = () => React.useContext(ThemeContext)

const initialThemeState = {
    dark: false,
    hasThemeMounted: false,
}

const useEffectDarkMode: DarkModeHook = () => {
    const [themeState, setThemeState] = React.useState<ThemeState>(
        initialThemeState
    )
    React.useEffect(() => {
        const isDark = localStorage.getItem('themeDarkMode') === 'true'
        setThemeState({ ...themeState, dark: isDark, hasThemeMounted: true })
    }, [])
    return [themeState, setThemeState]
}

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [themeState, setThemeState] = useEffectDarkMode()
    if (!themeState.hasThemeMounted) {
        return <div />
    }
    const toggle = () => {
        const themeDarkMode = !themeState.dark
        localStorage.setItem('themeDarkMode', JSON.stringify(themeDarkMode))
        setThemeState({ ...themeState, dark: themeDarkMode })
    }
    const computedTheme: Theme = themeState.dark
        ? defaultTheme('dark')
        : defaultTheme('light')

    const value = {
        dark: themeState.dark,
        toggle: toggle,
    }
    return (
        <EmotionThemeProvider theme={computedTheme}>
            <ThemeContext.Provider value={value}>
                {children}
            </ThemeContext.Provider>
        </EmotionThemeProvider>
    )
}

function useTheme() {
    const theme = EmoUsetheme<Theme>()
    return theme
}

export { ThemeProvider, useThemeToggler, useTheme }
