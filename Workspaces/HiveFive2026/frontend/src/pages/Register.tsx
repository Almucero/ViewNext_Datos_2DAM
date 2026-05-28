import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { hasOnlyAlphabeticNames, isValidEmail, register } from '../services/authService'
import { useLanguage } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import hiveFiveLogo from '../assets/Hive5_LOGO.png'

function Register() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const sanitizedFirstName = firstName.trim()
    const sanitizedLastName = lastName.trim()
    const sanitizedEmail = email.trim()
    const sanitizedPassword = password.trim()

    if (!sanitizedFirstName || !sanitizedLastName || !sanitizedEmail || !sanitizedPassword) {
      setSuccessMessage('')
      setError(t('fillAllFields'))
      return
    }

    if (!hasOnlyAlphabeticNames(sanitizedFirstName, sanitizedLastName)) {
      setSuccessMessage('')
      setError(t('namesOnlyLetters'))
      return
    }

    if (!isValidEmail(sanitizedEmail)) {
      setSuccessMessage('')
      setError(t('registerEmailInvalid'))
      return
    }

    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await register({
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        email: sanitizedEmail,
        password: sanitizedPassword,
      })

      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setSuccessMessage(t('registeredUserOk'))

      window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : t('registerCouldNotCreate')
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
          <p>{t('registerTitle')}</p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-header">
            <h2>{t('registerHeader')}</h2>
            <p>{t('registerFillData')}</p>
          </div>

          <div className="auth-grid">
            <label className="auth-field">
              <span>{t('firstName')}</span>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="Nombre"
                autoComplete="given-name"
              />
            </label>

            <label className="auth-field">
              <span>{t('lastName')}</span>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Apellido"
                autoComplete="family-name"
              />
            </label>
          </div>

          <label className="auth-field">
            <span>{t('email')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </label>

          <label className="auth-field">
            <span>{t('password')}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('createPassword')}
              autoComplete="new-password"
            />
          </label>

          {error ? <p className="auth-message auth-message-error">{error}</p> : null}
          {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? t('creatingAccount') : t('createAccount')}
          </button>

          <p className="auth-footer">
            {t('haveAccount')} <Link to="/login">{t('signIn')}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default Register
