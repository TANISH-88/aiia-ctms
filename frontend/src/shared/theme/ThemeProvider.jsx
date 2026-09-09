import { useEffect } from 'react'
import { useThemeStore } from './themeStore'
import { themeTokens } from './tokens'

export function ThemeProvider({ children }) {
  const { mode, theme } = useThemeStore()

  useEffect(() => {
    const palette = themeTokens[theme][mode]

    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-mode', mode)

    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }, [mode, theme])

  return children
}
