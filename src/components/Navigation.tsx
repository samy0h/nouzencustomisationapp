import { useLanguage } from '../contexts/LanguageContext';

export const Navigation = () => {
  const { t } = useLanguage();

  return (
    <nav className="nav">
      <a href="https://nouzen.store" target="_self">{t.navHome}</a>
    </nav>
  );
};
