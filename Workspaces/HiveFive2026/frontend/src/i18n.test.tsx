import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageProvider, useLanguage } from './i18n'

function Probe() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="text">{t('welcomeUser', { name: 'Ana' })}</span>
      <button type="button" onClick={() => setLanguage('en')}>
        EN
      </button>
      <button type="button" onClick={() => setLanguage('es')}>
        ES
      </button>
    </div>
  )
}

describe('i18n', () => {
  it('uses spanish by default and translates interpolated strings', () => {
    localStorage.removeItem('app-language')
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    )

    expect(screen.getByTestId('lang')).toHaveTextContent('es')
    expect(screen.getByTestId('text')).toHaveTextContent('Bienvenido, Ana')
  })

  it('persists selected language and updates text', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <Probe />
      </LanguageProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(screen.getByTestId('text')).toHaveTextContent('Welcome, Ana')
    expect(localStorage.getItem('app-language')).toBe('en')
  })
})
