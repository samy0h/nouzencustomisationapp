import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t } = useLanguage();
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  return (
    <div className="product-card">
      <Link to={`/custom/product/${product.slug}`} className="product-card-link">
        <div className="product-image-container">
          {hasDiscount && <span className="product-badge discount-badge">-{product.discountPercentage}%</span>}
          {!hasDiscount && product.badge && <span className="product-badge">{product.badge}</span>}
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>

          <div className="color-options">
            {product.colors.map((color, index) => (
              <span key={index} className="color-dot" style={{ background: color }}></span>
            ))}
          </div>

          <div className="product-price-section">
            <div className="product-price-wrapper">
              {hasDiscount && (
                <span className="product-old-price">{product.price} DZD</span>
              )}
              {!hasDiscount && product.oldPrice && (
                <span className="product-old-price">{product.oldPrice} DZD</span>
              )}
              <span className="product-price" style={hasDiscount ? { color: '#ef4444', fontWeight: '700' } : {}}>
                {hasDiscount ? discountedPrice : product.price} DZD
              </span>
            </div>
            <button className="customize-btn" onClick={(e) => e.preventDefault()}>
              {t.customizeBtn}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};
