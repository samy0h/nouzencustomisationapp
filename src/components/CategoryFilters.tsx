import { useLanguage } from '../contexts/LanguageContext';
import type { Product } from '../types';

interface CategoryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  products: Product[];
}

export const CategoryFilters = ({ activeCategory, onCategoryChange, products }: CategoryFiltersProps) => {
  const { t } = useLanguage();

  // Extract unique categories from products
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  const categories = [
    { value: 'all', label: t.filterAll },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
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
