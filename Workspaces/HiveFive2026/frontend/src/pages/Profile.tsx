import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword, getUserById, updateUser } from '../services/userService'
import { hasOnlyAlphabeticNames, isValidEmail } from '../services/authService'
import { useLanguage } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'

interface StoredUser {
  userId: number
  roleId?: number
  email: string
  firstName: string
  lastName: string
}

function Profile() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [userId, setUserId] = useState<number | null>(null)
  const [roleId, setRoleId] = useState<number>(3)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [modalError, setModalError] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      navigate('/login', { replace: true })
      return
    }

    let parsed: StoredUser
    try {
      parsed = JSON.parse(raw) as StoredUser
    } catch {
      navigate('/login', { replace: true })
      return
    }

    if (!parsed.userId) {
      navigate('/login', { replace: true })
      return
    }

    setUserId(parsed.userId)

    let cancelled = false
    ;(async () => {
      try {
        const user = await getUserById(parsed.userId)
        if (cancelled) {
          return
        }
        setRoleId(Number(user.roleId))
        setFirstName(user.firstName ?? '')
        setLastName(user.lastName ?? '')
        setEmail(user.email ?? '')
      } catch {
        if (!cancelled) {
          setLoadError(t('profileLoadError'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [navigate, t])

  const persistSessionNames = (next: { email: string; firstName: string; lastName: string }) => {
    const raw = localStorage.getItem('user')
    if (!raw) {
      return
    }

    try {
      const parsed = JSON.parse(raw) as StoredUser
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...parsed,
          email: next.email,
          firstName: next.firstName,
          lastName: next.lastName,
        }),
      )
    } catch {
      // ignore malformed storage
    }
  }

  const handleSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (userId === null) {
      return
    }

    const sanitizedFirstName = firstName.trim()
    const sanitizedLastName = lastName.trim()
    const sanitizedEmail = email.trim()

    setSuccessMessage('')
    setFormError('')

    if (!sanitizedFirstName || !sanitizedLastName || !sanitizedEmail) {
      setFormError(t('fillAllFields'))
      return
    }

    if (!hasOnlyAlphabeticNames(sanitizedFirstName, sanitizedLastName)) {
      setFormError(t('namesOnlyLetters'))
      return
    }

    if (sanitizedFirstName.length < 3 || sanitizedLastName.length < 3) {
      setFormError(t('namesMinLength'))
      return
    }

    if (!isValidEmail(sanitizedEmail)) {
      setFormError(t('registerEmailInvalid'))
      return
    }

    setIsSaving(true)

    try {
      await updateUser({
        id: userId,
        roleId,
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        password: '',
      })
      persistSessionNames({
        email: sanitizedEmail,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
      })
      setSuccessMessage(t('profileUpdated'))
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : t('profileUpdateError'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    closePasswordModal()
    navigate('/login', { replace: true })
  }

  const openPasswordModal = () => {
    setModalError('')
    setCurrentPassword('')
    setNewPasswordValue('')
    setConfirmNewPassword('')
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setModalError('')
    setCurrentPassword('')
    setNewPasswordValue('')
    setConfirmNewPassword('')
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (userId === null) {
      return
    }

    setModalError('')

    if (!currentPassword.trim() || !newPasswordValue.trim() || !confirmNewPassword.trim()) {
      setModalError(t('fillAllFields'))
      return
    }

    if (newPasswordValue !== confirmNewPassword) {
      setModalError(t('passwordsDoNotMatch'))
      return
    }

    setIsChangingPassword(true)

    try {
      await changePassword(userId, currentPassword, newPasswordValue)
      setSuccessMessage(t('passwordChanged'))
      closePasswordModal()
    } catch (submitError) {
      if (submitError instanceof Error && submitError.message === 'CURRENT_PASSWORD_INCORRECT') {
        setModalError(t('currentPasswordIncorrect'))
      } else {
        setModalError(submitError instanceof Error ? submitError.message : t('passwordChangeError'))
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <main className="auth-page profile-page">
        <div className="auth-loading-spinner" role="status" aria-label={t('loading')} />
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="auth-page profile-page">
        <section className="auth-shell">
          <p className="auth-message auth-message-error">{loadError}</p>
          <Link to="/dashboard" className="dashboard-link-button">
            {t('backToDashboard')}
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page profile-page">
      <section className="auth-shell profile-shell">
        <div className="auth-brand profile-top-left">
          <div className="profile-brand-top-row">
            <a
              className="auth-badge profile-company-badge"
              href="https://www.viewnext.com/blog-tecnologia-the-next/"
              target="_blank"
              rel="noreferrer"
            >
              {t('companyName')}
            </a>
            <LanguageSwitcher />
          </div>
          <h1>{t('profileTitle')}</h1>
          <p>{t('profileSubtitle')}</p>
        </div>

        <form className="auth-card profile-top-right" onSubmit={handleSubmitProfile}>
          <div className="auth-card-header">
            <h2>{t('myProfile')}</h2>
          </div>

          <div className="auth-grid">
            <label className="auth-field">
              <span>{t('firstName')}</span>
              <input
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
              />
            </label>

            <label className="auth-field">
              <span>{t('lastName')}</span>
              <input
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
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
              autoComplete="email"
            />
          </label>

          {formError ? <p className="auth-message auth-message-error">{formError}</p> : null}
          {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}

          <div className="profile-form-actions">
            <button type="submit" className="auth-button profile-primary-button" disabled={isSaving}>
              {isSaving ? t('savingProfile') : t('saveProfile')}
            </button>
            <button type="button" className="dashboard-logout" onClick={openPasswordModal}>
              {t('changePassword')}
            </button>
          </div>
        </form>

        <Link to="/dashboard" className="dashboard-link-button profile-bottom-button profile-bottom-left">
          {t('backToDashboard')}
        </Link>
        <button
          type="button"
          className="dashboard-logout logout-danger profile-bottom-button profile-bottom-right"
          onClick={handleLogout}
        >
          {t('logout')}
        </button>
      </section>

      {isPasswordModalOpen ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => {
            if (!isChangingPassword) {
              closePasswordModal()
            }
          }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h3>{t('changePassword')}</h3>
            <form className="profile-password-modal-form" onSubmit={handlePasswordSubmit}>
              <label className="auth-field">
                <span>{t('currentPassword')}</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className="auth-field">
                <span>{t('newPassword')}</span>
                <input
                  type="password"
                  value={newPasswordValue}
                  onChange={(event) => setNewPasswordValue(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <label className="auth-field">
                <span>{t('confirmNewPassword')}</span>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>

              {modalError ? <p className="auth-message auth-message-error">{modalError}</p> : null}

              <div className="modal-actions">
                <button
                  type="button"
                  className="dashboard-logout"
                  onClick={closePasswordModal}
                  disabled={isChangingPassword}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="auth-button" disabled={isChangingPassword}>
                  {isChangingPassword ? t('saving') : t('updatePassword')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default Profile
