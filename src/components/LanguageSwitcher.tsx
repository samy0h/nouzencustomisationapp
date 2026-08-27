import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../types';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const [pillStyle, setPillStyle] = useState<{ width: number; transform: string }>({ width: 0, transform: 'translateX(0px)' });
  const switcherRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const updatePillPosition = () => {
    const activeButton = buttonRefs.current[language];
    const switcherElement = switcherRef.current;

    if (activeButton && switcherElement) {
      const switcherRect = switcherElement.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const leftOffset = buttonRect.left - switcherRect.left;

      setPillStyle({
        width: buttonRect.width,
        transform: `translateX(${leftOffset}px)`
      });
    }
  };

  useEffect(() => {
    updatePillPosition();
    window.addEventListener('resize', updatePillPosition);
    return () => window.removeEventListener('resize', updatePillPosition);
  }, [language]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className="lang-switcher" ref={switcherRef}>
      <div
        className="lang-pill"
        style={pillStyle}
      />
      <button
        ref={(el) => { buttonRefs.current['ar'] = el; }}
        className={`lang-option ${language === 'ar' ? 'active' : ''}`}
        data-lang="ar"
        onClick={() => handleLanguageChange('ar')}
      >
        <span className="flag-icon">🇩🇿</span>AR
      </button>
      <button
        ref={(el) => { buttonRefs.current['fr'] = el; }}
        className={`lang-option ${language === 'fr' ? 'active' : ''}`}
        data-lang="fr"
        onClick={() => handleLanguageChange('fr')}
      >
        <span className="flag-icon">🇫🇷</span>FR
      </button>
      <button
        ref={(el) => { buttonRefs.current['en'] = el; }}
        className={`lang-option ${language === 'en' ? 'active' : ''}`}
        data-lang="en"
        onClick={() => handleLanguageChange('en')}
      >
        <span className="flag-icon">🇬🇧</span>EN
      </button>
    </div>
  );
};
