import { useLanguage } from '../contexts/LanguageContext';
import type { SortOption } from '../types';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const { t } = useLanguage();

  return (
    <select
      className="sort-dropdown"
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
    >
      <option value="featured">{t.sortFeatured}</option>
      <option value="price-low">{t.sortPriceLow}</option>
      <option value="price-high">{t.sortPriceHigh}</option>
    </select>
  );
};
