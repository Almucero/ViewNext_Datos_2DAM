import { useLanguage } from '../i18n'

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      className={`language-switcher language-switcher--${language}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        className={`language-switcher-button ${language === 'es' ? 'active' : ''}`}
        onClick={() => setLanguage('es')}
      >
        {t('languageSpanish')}
      </button>
      <button
        type="button"
        className={`language-switcher-button ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
      >
        {t('languageEnglish')}
      </button>
    </div>
  )
}

export default LanguageSwitcher
