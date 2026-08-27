import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
  ];

  return (
    <div className="language-switcher">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          className={`lang-btn ${language === code ? 'active' : ''}`}
          onClick={() => setLanguage(code)}
          aria-label={`Switch to ${label}`}
        >
          <span className="lang-flag">{flag}</span>
          <span className="lang-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
