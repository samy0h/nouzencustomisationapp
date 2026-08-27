import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t, language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleCustomize = () => {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
      const message = language === 'fr'
        ? `Personnalisation de: ${product.name}\n\nDans l'application réelle, ceci naviguerait vers:\n/custom/editor/${product.id}`
        : language === 'ar'
        ? `تخصيص: ${product.name}\n\nفي التطبيق الحقيقي، سيتم الانتقال إلى:\n/custom/editor/${product.id}`
        : `Customizing: ${product.name}\n\nIn the real app, this would navigate to:\n/custom/editor/${product.id}`;
      alert(message);
    }, 1500);
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image-container">
          {product.badge && <span className="product-badge">{product.badge}</span>}
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
              {product.oldPrice && (
                <span className="product-old-price">{product.oldPrice} DZD</span>
              )}
              <span className="product-price">{product.price} DZD</span>
            </div>
            <button className="customize-btn" onClick={handleCustomize}>
              {t.customizeBtn}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h3>{t.modalTitle}</h3>
            <p>{t.modalText}</p>
            <div className="spinner"></div>
          </div>
        </div>
      )}
    </>
  );
};
