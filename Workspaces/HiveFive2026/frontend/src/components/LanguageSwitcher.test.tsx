import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../i18n'
import LanguageSwitcher from './LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('toggles language and active state', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    )

    const esButton = screen.getByRole('button', { name: 'ES' })
    const enButton = screen.getByRole('button', { name: 'EN' })

    expect(esButton).toHaveClass('active')
    expect(enButton).not.toHaveClass('active')

    await user.click(enButton)

    expect(enButton).toHaveClass('active')
    expect(esButton).not.toHaveClass('active')
  })
})
