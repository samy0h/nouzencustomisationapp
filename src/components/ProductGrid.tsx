import { ProductCard } from './ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="product-grid">
        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
          {t.noProducts}
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="productGrid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
