import { useLanguage } from '../contexts/LanguageContext';

export const PageHeader = () => {
  const { t } = useLanguage();

  return (
    <div className="page-header">
      <div className="page-eyebrow">{t.pageEyebrow}</div>
      <h1 className="page-title">{t.pageTitle}</h1>
      <p className="page-subtitle">{t.pageSubtitle}</p>
    </div>
  );
};
