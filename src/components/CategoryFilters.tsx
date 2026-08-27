import { useLanguage } from '../contexts/LanguageContext';

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilters = ({ activeCategory, onCategoryChange }: CategoryFiltersProps) => {
  const { t } = useLanguage();

  const categories = [
    { value: 'all', label: t.filterAll },
    { value: 'Tshirt', label: t.filterTshirt },
    { value: 'Hoodie', label: t.filterHoodie },
    { value: 'Polo', label: t.filterPolo },
    { value: 'Tote bag', label: t.filterTotebag },
    { value: 'Tshirt oversize', label: t.filterOversize },
    { value: 'Cap', label: t.filterCap },
  ];

  return (
    <div className="filter-buttons">
      {categories.map((category) => (
        <button
          key={category.value}
          className={`filter-btn ${activeCategory === category.value ? 'active' : ''}`}
          data-category={category.value}
          onClick={() => onCategoryChange(category.value)}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};
