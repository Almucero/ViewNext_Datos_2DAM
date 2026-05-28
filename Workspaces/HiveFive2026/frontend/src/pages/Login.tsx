import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isValidEmail, login } from '../services/authService'
import { useLanguage } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import hiveFiveLogo from '../assets/Hive5_LOGO.png'

const RECENT_LOGIN_EMAILS_KEY = 'recent-login-emails'
const MAX_RECENT_LOGIN_EMAILS = 8

const getRecentLoginEmails = () => {
  const savedEmails = localStorage.getItem(RECENT_LOGIN_EMAILS_KEY)

  if (!savedEmails) {
    return []
  }

  try {
    const parsedEmails = JSON.parse(savedEmails)
    return Array.isArray(parsedEmails)
      ? parsedEmails.filter((email): email is string => typeof email === 'string')
      : []
  } catch {
    return []
  }
}

function Login() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [recentEmails, setRecentEmails] = useState<string[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    setRecentEmails(getRecentLoginEmails())
  }, [])

  const persistRecentEmail = (value: string) => {
    const sanitizedEmail = value.trim().toLowerCase()

    if (!sanitizedEmail) {
      return
    }

    const nextEmails = [
      sanitizedEmail,
      ...recentEmails.filter((savedEmail) => savedEmail !== sanitizedEmail),
    ].slice(0, MAX_RECENT_LOGIN_EMAILS)

    setRecentEmails(nextEmails)
    localStorage.setItem(RECENT_LOGIN_EMAILS_KEY, JSON.stringify(nextEmails))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError(t('fillLoginFields'))
      return
    }

    if (!isValidEmail(email.trim())) {
      setError(t('invalidEmailFormat'))
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const user = await login(email, password)
      persistRecentEmail(email)
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t('loginServerError')
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand">
          <div className="auth-brand-head">
            <span className="auth-badge profile-company-badge">{t('companyName')}</span>
            <LanguageSwitcher />
          </div>
          <img src={hiveFiveLogo} alt={t('appName')} className="auth-brand-logo" />
          <h1>{t('appName')}</h1>
          <p>{t('loginTitle')}</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <h2>{t('loginWelcome')}</h2>
            <p>{t('loginEnterCredentials')}</p>
          </div>

          <label className="auth-field">
            <span>{t('email')}</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              list="recent-login-emails"
            />
          </label>
          <datalist id="recent-login-emails">
            {recentEmails.map((savedEmail) => (
              <option key={savedEmail} value={savedEmail} />
            ))}
          </datalist>

          <label className="auth-field">
            <span>{t('password')}</span>
            <div className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                title={showPassword ? t('hidePassword') : t('showPassword')}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 5C7.5 5 3.7 7.7 2 12c1.7 4.3 5.5 7 10 7s8.3-2.7 10-7c-1.7-4.3-5.5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="2.1" fill="currentColor" />
                </svg>
              </button>
            </div>
          </label>

          {error ? <p className="auth-message auth-message-error">{error}</p> : null}

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? t('loginLoading') : t('loginButton')}
          </button>

          <p className="auth-footer">
            {t('noAccount')} <Link to="/register">{t('registerHere')}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Login
