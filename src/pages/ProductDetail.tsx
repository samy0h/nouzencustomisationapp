import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useProduct } from '../hooks/useProduct';
import { getProductImage } from '../utils/imageHelpers';
import { fabric } from 'fabric';
import type { PrintingSide } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/productDetail.css';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { product, loading, error, retry } = useProduct(slug || '');

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [printingSide, setPrintingSide] = useState<PrintingSide>('FRONT');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const printableBounds = {
    left: 108,
    top: 82,
    width: 184,
    height: 330,
  };

  // Get unique colors from variants
  const availableColors = useMemo(() => {
    if (!product) return [];
    const colorMap = new Map<string, { color: string; colorHex: string }>();
    product.variants.forEach(v => {
      if (!colorMap.has(v.color)) {
        colorMap.set(v.color, { color: v.color, colorHex: v.colorHex });
      }
    });
    return Array.from(colorMap.values());
  }, [product]);

  // Get available sizes for selected color
  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size);
  }, [product, selectedColor]);

  // Get the selected variant
  const selectedVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return null;
    return product.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  // Get the current display image
  const currentImage = useMemo(() => {
    if (!product || !selectedColor || !slug) {
      return product?.images?.[0] || '';
    }

    const side = product.supportsDoublePrint && printingSide === 'BACK' ? 'back' : 'front';
    return getProductImage(slug, selectedColor, side);
  }, [selectedColor, printingSide, product, slug]);

  // Auto-select first color when product loads
  useEffect(() => {
    if (product && availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].color);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, availableColors]);

  // Auto-select first size when color changes
  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableSizes]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 500,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [product]);

  // Handle image upload
  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;

        fabric.Image.fromURL(imgUrl, (img: fabric.Image) => {
          if (!fabricCanvasRef.current) return;

          const canvas = fabricCanvasRef.current;
          const scale = Math.min(
            (printableBounds.width * 0.85) / img.width!,
            (printableBounds.height * 0.85) / img.height!
          );

          img.scale(scale);
          img.set({
            left: printableBounds.left + printableBounds.width / 2,
            top: printableBounds.top + printableBounds.height / 2,
            originX: 'center',
            originY: 'center',
            cornerStyle: 'circle',
            cornerColor: 'white',
            cornerStrokeColor: '#A00223',
            borderColor: '#A00223',
            cornerSize: 10,
            transparentCorners: false,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      };

      reader.readAsDataURL(file);
    };

    input.click();
  };

  // Handle add text
  const handleAddText = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const text = new fabric.IText('Your text', {
      left: printableBounds.left + printableBounds.width / 2,
      top: printableBounds.top + printableBounds.height / 2,
      originX: 'center',
      originY: 'center',
      fontSize: 30,
      fill: '#000000',
      fontFamily: 'Montserrat',
      cornerStyle: 'circle',
      cornerColor: 'white',
      cornerStrokeColor: '#A00223',
      borderColor: '#A00223',
      cornerSize: 10,
      transparentCorners: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleCustomize = () => {
    if (!selectedVariant) return;

    navigate(`/custom/product/${slug}/customize`, {
      state: {
        productId: product?.id,
        productSlug: slug,
        variantId: selectedVariant.id,
        color: selectedColor,
        size: selectedSize,
        printingSide: product?.supportsDoublePrint ? printingSide : null,
        price: product?.price,
        productName: product?.name,
      },
    });
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <div className="error-icon">⚠️</div>
        <h2>{t.error}</h2>
        <p>{error || 'Product not found'}</p>
        <button onClick={retry} className="btn-retry">
          {t.retry}
        </button>
        <Link to="/catalog" className="btn-back">
          {t.backToCatalog}
        </Link>
      </div>
    );
  }

  const isRTL = language === 'ar';

  return (
    <div className={`product-detail-modern ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back Link & Language Switcher */}
      <div className="container-fluid">
        <div className="top-bar">
          <Link to="/catalog" className="back-link-modern">
            <span className="back-arrow">←</span>
            {t.backToCatalog}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Workspace */}
      <div className="customization-workspace">
        {/* Preview Section */}
        <div className="preview-section">
          <div className="preview-card">
            {/* Front/Back Switcher */}
            {product.supportsDoublePrint && (
              <div className="side-switcher">
                <button
                  className={`side-btn ${printingSide === 'FRONT' ? 'active' : ''}`}
                  onClick={() => setPrintingSide('FRONT')}
                >
                  {t.printingSideFront}
                </button>
                <button
                  className={`side-btn ${printingSide === 'BACK' ? 'active' : ''}`}
                  onClick={() => setPrintingSide('BACK')}
                >
                  {t.printingSideBack}
                </button>
              </div>
            )}

            {/* Product Display */}
            <div className="product-display">
              <div className="product-stage">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="product-image"
                />
                <div className="printable-area" aria-hidden="true" />
                <div className="canvas-editor">
                  <canvas ref={canvasRef} className="design-canvas" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="preview-actions">
              <button className="action-btn" onClick={handleAddImage}>
                <span className="action-icon">+</span>
                <span>{t.addImage}</span>
              </button>
              <button className="action-btn" onClick={handleAddText}>
                <span className="action-icon">+</span>
                <span>{t.addText}</span>
              </button>
            </div>

            <p className="editor-hint">Utilisez le canevas ci-dessus pour personnaliser votre produit</p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="config-panel">
          {/* Product Info Card */}
          <div className="info-card">
            <h1 className="product-name">
              {product.name} <span className="customized-label">{t.customizedProduct}</span>
            </h1>
            <p className="product-meta">
              {product.category.name} · {product.description?.substring(0, 30) || 'Détail'}
            </p>
          </div>

          {/* Color Selector Card */}
          <div className="selector-card">
            <div className="selector-header">
              <span className="selector-label">{t.productColor}</span>
              <span className="selector-value">{selectedColor}</span>
            </div>
            <div className="color-grid">
              {availableColors.map(({ color, colorHex }) => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: colorHex }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  aria-label={color}
                >
                  {selectedColor === color && <span className="check-icon">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector Card */}
          <div className="selector-card">
            <div className="selector-header">
              <span className="selector-label">{t.productSize}</span>
              <span className="selector-value">{selectedSize || t.chooseSize}</span>
            </div>
            <div className="size-grid">
              {availableSizes.map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Card */}
          <div className="price-card">
            <div className="price-row">
              <span className="price-label">{t.unitPrice}</span>
              <span className="price-amount">{product.price.toLocaleString()} DZD</span>
            </div>
            <div className="price-divider" />
            <div className="price-row price-total">
              <span className="price-label">{t.price}</span>
              <span className="price-amount">{product.price.toLocaleString()} DZD</span>
            </div>
            <p className="price-note">{t.validateOrder}</p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="bottom-action-bar">
        <div className="action-bar-content">
          <div className="action-bar-info">
            <div className="action-bar-price">{product.price.toLocaleString()} DZD</div>
            <div className="action-bar-product">
              {product.name} · {selectedColor}
            </div>
          </div>
          <div className="action-bar-buttons">
            <button className="btn-add-cart" disabled={!selectedVariant}>
              {t.addToCart}
            </button>
            <button
              className="btn-order-now"
              onClick={handleCustomize}
              disabled={!selectedVariant}
            >
              {t.order}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
