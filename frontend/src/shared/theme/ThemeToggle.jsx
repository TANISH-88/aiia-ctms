import { useThemeStore } from './themeStore'

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore()

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label="Toggle theme mode"
      style={{
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        borderRadius: '999px',
        padding: '0.6rem 0.9rem',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
