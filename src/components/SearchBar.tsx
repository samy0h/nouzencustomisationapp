import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const { t } = useLanguage();

  return (
    <div className="search-bar">
      <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder={t.searchPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
