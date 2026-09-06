import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useProduct } from '../hooks/useProduct';
import { cartStore, useCart } from '../stores/cartStore';
import { getProductImage } from '../utils/imageHelpers';
import { fabric } from 'fabric';
import { ShoppingBasket, ShoppingCart } from 'lucide-react';
import type { PrintingSide } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import OrderForm from '../components/OrderForm';
import '../styles/productDetail.css';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useLanguage();
  const { itemCount } = useCart();
  const { product, loading, error, retry } = useProduct(slug || '');

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [printingSide, setPrintingSide] = useState<PrintingSide>('FRONT');
  const [selectedTextObject, setSelectedTextObject] = useState<fabric.IText | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Bebas Neue');
  const [selectedTextColor, setSelectedTextColor] = useState('#ffffff');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orderSectionRef = useRef<HTMLElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const designsBySideRef = useRef<Record<PrintingSide, object | null>>({
    FRONT: null,
    BACK: null,
    BOTH: null,
  });

  const defaultPrintableBounds = {
    left: 216,
    top: 164,
    width: 368,
    height: 660,
  };

  const configuredPrintArea = product?.printAreas?.find(area => area.side === printingSide);
  const printAreaEnabled = configuredPrintArea?.enabled ?? true;
  const printableBounds = configuredPrintArea
    ? {
      left: configuredPrintArea.x * 800,
      top: configuredPrintArea.y * 1000,
      width: configuredPrintArea.width * 800,
      height: configuredPrintArea.height * 1000,
    }
    : defaultPrintableBounds;

  const createPrintableClipPath = () => new fabric.Rect({
    left: printableBounds.left + printableBounds.width / 2,
    top: printableBounds.top + printableBounds.height / 2,
    width: printableBounds.width,
    height: printableBounds.height,
    originX: 'center',
    originY: 'center',
    absolutePositioned: true,
  });

  const fontOptions = [
    'Montserrat',
    'Poppins',
    'Oswald',
    'Playfair Display',
    'Bebas Neue',
  ];

  const saveCanvasForSide = (side: PrintingSide) => {
    if (fabricCanvasRef.current) {
      designsBySideRef.current[side] = fabricCanvasRef.current.toJSON(['fileName']);
    }
  };

  const handleSideChange = (side: PrintingSide) => {
    saveCanvasForSide(printingSide);
    setPrintingSide(side);
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

    const configuredImage = product.productImages?.find(image =>
      image.color === selectedColor && image.side === (printingSide === 'BACK' ? 'BACK' : 'FRONT')
    );
    if (configuredImage) return configuredImage.url;

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

  // Keep the confirmation page visible: the order form is only closed
  // when the user explicitly starts a new order (see handleOrderNow).

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1000,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
        clipPath: printAreaEnabled ? createPrintableClipPath() : undefined,
    });

    fabricCanvasRef.current = canvas;

    const syncSelectedText = () => {
      const activeObject = canvas.getActiveObject();
      if (!activeObject || activeObject.type !== 'i-text') {
        setSelectedTextObject(null);
        setSelectedObject(activeObject || null);
        const imageObject = activeObject as (fabric.Object & { fileName?: string }) | null;
        setSelectedImageName(activeObject?.type === 'image' ? String(imageObject?.fileName || '') : '');
        return;
      }

      const textObject = activeObject as fabric.IText;
      setSelectedTextObject(textObject);
      setSelectedObject(textObject);
      setSelectedImageName('');
      setSelectedFont(String(textObject.get('fontFamily') || 'Bebas Neue'));
      setSelectedTextColor(String(textObject.get('fill') || '#ffffff'));
    };

    canvas.on('selection:created', syncSelectedText);
    canvas.on('selection:updated', syncSelectedText);
    canvas.on('selection:cleared', syncSelectedText);

    return () => {
      saveCanvasForSide(printingSide);
      canvas.off('selection:created', syncSelectedText);
      canvas.off('selection:updated', syncSelectedText);
      canvas.off('selection:cleared', syncSelectedText);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [product]);

  // Restore the independent design associated with the selected printing side.
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = 'transparent';
    canvas.clipPath = printAreaEnabled ? createPrintableClipPath() : undefined;
    setSelectedTextObject(null);
    setSelectedObject(null);
    setSelectedImageName('');
    const savedDesign = designsBySideRef.current[printingSide];
    if (savedDesign) {
      canvas.loadFromJSON(savedDesign, () => canvas.renderAll());
    } else {
      canvas.renderAll();
    }
  }, [printingSide, printAreaEnabled]);

  const updateSelectedText = (property: 'fontFamily' | 'fill', value: string) => {
    const activeObject = fabricCanvasRef.current?.getActiveObject();
    if (!activeObject || activeObject.type !== 'i-text') return;

    const textObject = activeObject as fabric.IText;
    textObject.set(property, value);
    fabricCanvasRef.current?.renderAll();
    if (property === 'fontFamily') setSelectedFont(value);
    if (property === 'fill') setSelectedTextColor(value);
  };

  const removeSelectedText = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject || activeObject.type !== 'i-text') return;

    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedTextObject(null);
  };

  const removeSelectedImage = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas?.getActiveObject();
    if (!canvas || !activeObject || activeObject.type !== 'image') return;

    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    setSelectedImageName('');
  };

  const rotateSelectedObject = () => {
    if (!selectedObject || !fabricCanvasRef.current) return;
    selectedObject.rotate(((selectedObject.angle || 0) + 90) % 360);
    fabricCanvasRef.current.renderAll();
  };

  const flipSelectedObject = () => {
    if (!selectedObject || !fabricCanvasRef.current) return;
    selectedObject.set('flipX', !selectedObject.flipX);
    fabricCanvasRef.current.renderAll();
  };

  const duplicateSelectedObject = () => {
    const canvas = fabricCanvasRef.current;
    if (!selectedObject || !canvas) return;

    selectedObject.clone((clone: fabric.Object) => {
      clone.set({
        left: (selectedObject.left || 0) + 24,
        top: (selectedObject.top || 0) + 24,
      });
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.renderAll();
    }, ['fileName']);
  };

  const removeSelectedObject = () => {
    if (selectedObject?.type === 'i-text') removeSelectedText();
    if (selectedObject?.type === 'image') removeSelectedImage();
  };

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
          (img as fabric.Image & { fileName?: string }).fileName = file.name;

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
      fontSize: 60,
      fill: '#ffffff',
      fontFamily: 'Bebas Neue',
      cornerStyle: 'circle',
      cornerColor: 'white',
      cornerStrokeColor: '#A00223',
      borderColor: '#A00223',
      cornerSize: 10,
      transparentCorners: false,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    setSelectedTextObject(text);
    setSelectedFont('Bebas Neue');
    setSelectedTextColor('#ffffff');
    canvas.renderAll();
  };

  const MOCKUP_CANVAS_WIDTH = 800;
  const MOCKUP_CANVAS_HEIGHT = 1000;

  const loadImageElement = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const captureMockupDataUrl = async (productImageSrc: string): Promise<string | null> => {
    const designCanvasEl = fabricCanvasRef.current?.getElement();
    if (!designCanvasEl) return null;

    try {
      const productImg = await loadImageElement(productImageSrc);
      const mockupCanvas = document.createElement('canvas');
      mockupCanvas.width = MOCKUP_CANVAS_WIDTH;
      mockupCanvas.height = MOCKUP_CANVAS_HEIGHT;
      const ctx = mockupCanvas.getContext('2d');
      if (!ctx) return null;

      const scale = Math.min(MOCKUP_CANVAS_WIDTH / productImg.width, MOCKUP_CANVAS_HEIGHT / productImg.height);
      const drawWidth = productImg.width * scale;
      const drawHeight = productImg.height * scale;
      const offsetX = (MOCKUP_CANVAS_WIDTH - drawWidth) / 2;
      const offsetY = (MOCKUP_CANVAS_HEIGHT - drawHeight) / 2;
      ctx.drawImage(productImg, offsetX, offsetY, drawWidth, drawHeight);

      ctx.drawImage(designCanvasEl, 0, 0, MOCKUP_CANVAS_WIDTH, MOCKUP_CANVAS_HEIGHT);

      return mockupCanvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };

  const serializeCartItem = async () => {
    if (!product || !selectedVariant || !slug) return null;

    saveCanvasForSide(printingSide);
    const hasDesign = Object.values(designsBySideRef.current).some(design => {
      const objects = (design as { objects?: unknown[] } | null)?.objects;
      return Boolean(objects?.length);
    });

    if (!hasDesign) {
      setCartMessage('Add a text or image before adding this customized item.');
      return null;
    }

    const activeDesignDataUrl = fabricCanvasRef.current?.toDataURL({ format: 'png', multiplier: 1 }) ?? null;
    const mockupDataUrl = (await captureMockupDataUrl(currentImage)) ?? activeDesignDataUrl;

    const isBack = printingSide === 'BACK';
    const customizationData = {
      productSlug: slug,
      printingSide,
      printAreas: product.printAreas ?? [],
      designsBySide: designsBySideRef.current,
    };

    return {
      id: `${Date.now()}-${crypto.randomUUID()}`,
      productId: product.id,
      productSlug: slug,
      variantId: selectedVariant.id,
      productName: product.name,
      productImage: currentImage,
      unitPrice: selectedVariant.priceOverride ?? product.price,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      fit: 'regular',
      customizationData,
      mockupFrontDataUrl: !isBack ? mockupDataUrl : null,
      mockupBackDataUrl: isBack ? mockupDataUrl : null,
      designFrontDataUrl: !isBack ? activeDesignDataUrl : null,
      designBackDataUrl: isBack ? activeDesignDataUrl : null,
      createdAt: new Date().toISOString(),
    };
  };

  const handleAddToCart = async () => {
    const item = await serializeCartItem();
    if (!item) return;

    cartStore.addItem(item);
    setCartMessage('Added to cart.');
  };

  const handleOrderNow = async () => {
    // If form is shown and cart is empty, reset to allow new order
    if (showOrderForm && itemCount === 0) {
      setShowOrderForm(false);
      return;
    }

    // If form is shown and cart has items, just scroll to it
    if (showOrderForm && itemCount > 0) {
      orderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Add item and show form
    const item = await serializeCartItem();
    if (!item) return;

    cartStore.addItem(item);
    setShowOrderForm(true);
    requestAnimationFrame(() => orderSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
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
          <Link to="/cart" className="product-cart-link">
            <ShoppingCart size={18} />
            {t.cartText} ({itemCount})
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
                  onClick={() => handleSideChange('FRONT')}
                >
                  {t.printingSideFront}
                </button>
                <button
                  className={`side-btn ${printingSide === 'BACK' ? 'active' : ''}`}
                  onClick={() => handleSideChange('BACK')}
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
                {printAreaEnabled && (
                  <div
                    className="printable-area"
                    aria-hidden="true"
                    style={{
                      left: `${(configuredPrintArea?.x ?? 0.27) * 100}%`,
                      top: `${(configuredPrintArea?.y ?? 0.165) * 100}%`,
                      width: `${(configuredPrintArea?.width ?? 0.46) * 100}%`,
                      height: `${(configuredPrintArea?.height ?? 0.66) * 100}%`,
                    }}
                  />
                )}
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

            {selectedObject && (
              <div className="text-controls object-controls">
                <span className="object-name">
                  {selectedImageName || 'Your text'}
                </span>
                <button className="object-action-btn" type="button" onClick={rotateSelectedObject} title={t.rotate} aria-label={t.rotate}>↻</button>
                <button className="object-action-btn" type="button" onClick={flipSelectedObject} title={t.flip} aria-label={t.flip}>⇋</button>
                <button className="object-action-btn" type="button" onClick={duplicateSelectedObject} title={t.duplicate} aria-label={t.duplicate}>＋</button>
                {selectedTextObject && <label className="text-control">
                  {t.font}
                  <select
                    className="font-select"
                    value={selectedFont}
                    onChange={event => updateSelectedText('fontFamily', event.target.value)}
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </label>}
                {selectedTextObject && <label className="text-control">
                  {t.textColor}
                  <input
                    className="text-color-input"
                    type="color"
                    value={selectedTextColor}
                    onChange={event => updateSelectedText('fill', event.target.value)}
                    aria-label={t.textColor}
                  />
                </label>}
                <button
                  className="remove-text-btn"
                  type="button"
                  onClick={removeSelectedObject}
                  title={selectedTextObject ? t.removeText : t.removeImage}
                  aria-label={selectedTextObject ? t.removeText : t.removeImage}
                >
                  ×
                </button>
              </div>
            )}

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
            {product.sizeChartImage && (
              <img
                className="size-chart-image"
                src={product.sizeChartImage}
                alt="Size dimensions"
              />
            )}
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
          {cartMessage && <p className="cart-feedback">{cartMessage}</p>}
        </div>
      </div>

      {showOrderForm && (
        <section className="inline-order-section" ref={orderSectionRef}>
          <OrderForm />
        </section>
      )}

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
            <button
              className="btn-order-now"
              onClick={handleOrderNow}
              disabled={!selectedVariant}
            >
              <ShoppingBasket size={20} />
              {showOrderForm && itemCount > 0 ? t.confirmOrder || 'Confirm Order' : t.order}
            </button>
            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              <ShoppingCart size={20} />
              {t.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
