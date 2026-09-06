import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import { api } from '../services/api';
import { useCart } from '../stores/cartStore';
import type { ApiOrder, CheckoutCustomer } from '../types';
import { WILAYAS, getDeliveryCost } from '../data/deliveryRates';
import '../styles/orders.css';

interface OrderFormProps {
  onBack?: () => void;
}

const formatDzd = (value: number) => `${value.toLocaleString()} DZD`;

const isValidUuid = (value: unknown): value is string => {
  return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
};

export default function OrderForm({ onBack }: OrderFormProps) {
  const { t } = useLanguage();
  const { items, subtotal, updateQuantity, removeItem, clear } = useCart();
  const [customer, setCustomer] = useState<CheckoutCustomer>({
    customerName: '',
    phone: '',
    wilaya: '',
    deliveryMethod: '',
    baladia: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<ApiOrder | null>(null);

  const deliveryCost = getDeliveryCost(customer.wilaya, customer.deliveryMethod) ?? 0;
  const total = subtotal + deliveryCost;

  const validateCustomer = (): boolean => {
    const errors: Record<string, string> = {};
    const name = customer.customerName.trim();
    const phone = customer.phone.trim();
    const wilaya = customer.wilaya.trim();
    const baladia = customer.baladia.trim();
    const address = customer.address.trim();

    // Accept Arabic, French, English letters, spaces, hyphens, apostrophes
    if (name.length < 2) {
      errors.customerName = 'Name must be at least 2 characters';
    }
    if (!/^0\d{9}$/.test(phone)) {
      errors.phone = 'Phone must start with 0 and have exactly 10 digits';
    }
    if (!wilaya) {
      errors.wilaya = t.wilayaRequired;
    }
    if (!customer.deliveryMethod) {
      errors.deliveryMethod = t.deliveryMethodRequired;
    }
    if (!baladia) {
      errors.baladia = 'Baladia is required';
    }
    if (address && address.length < 4) {
      errors.address = 'Address must be at least 4 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCartItems = (): boolean => {
    const invalid = items.some(item => {
      if (!isValidUuid(item.productId)) return true;
      if (!isValidUuid(item.variantId)) return true;
      if (!Number.isInteger(item.quantity) || item.quantity < 1) return true;
      if (!item.productName?.trim()) return true;
      if (!item.color?.trim()) return true;
      if (!item.size?.trim()) return true;
      return false;
    });
    if (invalid) {
      setError('Some cart items have invalid data. Please remove them and add the product again.');
    }
    return !invalid;
  };

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !items.length) return;

    console.log('[OrderForm] Validating customer:', customer);
    const customerValid = validateCustomer();
    console.log('[OrderForm] Customer valid:', customerValid, 'Field errors:', fieldErrors);

    const cartValid = validateCartItems();
    console.log('[OrderForm] Cart valid:', cartValid);

    if (!customerValid || !cartValid) {
      console.log('[OrderForm] Validation failed, not submitting');
      return;
    }

    setSubmitting(true);
    setError('');
    setFieldErrors({});
    try {
      console.log('[OrderForm] Submitting order...');
      const response = await api.createOrder({ customer, items });
      console.log('[OrderForm] Order created:', response.data.order);

      // Set confirmed order FIRST before clearing cart
      setConfirmedOrder(response.data.order);

      // Clear cart after a delay to allow confirmation to render
      setTimeout(() => {
        clear();
      }, 100);
    } catch (submitError) {
      console.error('[OrderForm] Submit error:', submitError);
      setError(submitError instanceof Error ? submitError.message : t.orderSubmitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="confirmation">
        <CheckCircle2 size={44} />
        <span className="order-eyebrow">{t.orderConfirmed}</span>
        <h1>#{confirmedOrder.orderNumber}</h1>
        <p>{t.total}: {formatDzd(confirmedOrder.total)}</p>
        <p>{t.paymentMethod}: {t.cashOnDelivery}</p>
        <p>{t.orderFollowUp}</p>
        <Link className="order-primary-link" to="/catalog">{t.backToCatalog}</Link>
      </div>
    );
  }

  return (
    <section className="order-form-section">
      <header className="order-header order-form-header">
        <div>
          <span className="order-eyebrow">{t.checkout}</span>
          <h2>{t.cashOnDelivery}</h2>
        </div>
        <div className="order-header-actions">
          {onBack && <button className="order-back" type="button" onClick={onBack}>{t.backToCart}</button>}
          <div className="order-form-language"><span>{t.language}</span><LanguageSwitcher /></div>
        </div>
      </header>

      {!items.length ? (
        <div className="empty-cart">
          <h2>{t.emptyCart}</h2>
          <Link className="order-primary-link" to="/catalog">{t.continueCustomizing}</Link>
        </div>
      ) : (
        <form className="checkout-layout" onSubmit={submitOrder}>
          <div className="checkout-form">
            <div className="checkout-items">
              <h3>{t.orderItems}</h3>
              {items.map(item => (
                <article className="checkout-item" key={item.id}>
                  <div className="checkout-item-thumb">
                    <img src={item.productImage} alt="" />
                    {(item.designFrontDataUrl || item.designBackDataUrl) && (
                      <img className="cart-design-layer" src={item.designFrontDataUrl || item.designBackDataUrl || ''} alt="" />
                    )}
                  </div>
                  <div className="checkout-item-main">
                    <strong>{item.productName}</strong>
                    <span>{item.color} / {item.size}</span>
                    <span>{formatDzd(item.unitPrice)}</span>
                  </div>
                  <div className="quantity-control">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={t.decreaseQuantity}><Minus size={15} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={t.increaseQuantity}><Plus size={15} /></button>
                  </div>
                  <div className="item-remove-col">
                    <button className="cart-icon-btn" type="button" onClick={() => removeItem(item.id)} title={t.removeItem} aria-label={t.removeItem}><Trash2 size={16} /></button>
                    <button className="cart-remove-text" type="button" onClick={() => removeItem(item.id)}>{t.removeItem}</button>
                  </div>
                </article>
              ))}
            </div>
            <label>
              {t.fullName} <span className="required-mark">*</span>
              <input
                required
                value={customer.customerName}
                onChange={event => setCustomer({ ...customer, customerName: event.target.value })}
                title="Name can only contain letters, spaces, hyphens and apostrophes"
              />
              {fieldErrors.customerName && <span className="field-error">{fieldErrors.customerName}</span>}
            </label>
            <label>
              {t.phoneNumber} <span className="required-mark">*</span>
              <input
                required
                value={customer.phone}
                onChange={event => setCustomer({ ...customer, phone: event.target.value })}
                title="Phone must start with 0 and have exactly 10 digits"
                maxLength={10}
              />
              {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
            </label>
            <label>
              {t.wilaya} <span className="required-mark">*</span>
              <select required value={customer.wilaya} onChange={event => setCustomer({ ...customer, wilaya: event.target.value })}>
                <option value="" disabled>{t.selectWilaya}</option>
                {WILAYAS.map(wilaya => (
                  <option key={wilaya} value={wilaya}>{wilaya}</option>
                ))}
              </select>
              {fieldErrors.wilaya && <span className="field-error">{fieldErrors.wilaya}</span>}
            </label>
            <label>
              {t.deliveryMethod} <span className="required-mark">*</span>
              <select
                required
                value={customer.deliveryMethod}
                onChange={event => setCustomer({ ...customer, deliveryMethod: event.target.value as CheckoutCustomer['deliveryMethod'] })}
              >
                <option value="" disabled>{t.deliveryMethod}</option>
                <option value="A_DOMICILE">
                  {t.domicile}{customer.wilaya ? ` — ${formatDzd(getDeliveryCost(customer.wilaya, 'A_DOMICILE') ?? 0)}` : ''}
                </option>
                <option value="STOP_DESK">
                  {t.stopDesk}{customer.wilaya ? ` — ${formatDzd(getDeliveryCost(customer.wilaya, 'STOP_DESK') ?? 0)}` : ''}
                </option>
              </select>
              {fieldErrors.deliveryMethod && <span className="field-error">{fieldErrors.deliveryMethod}</span>}
            </label>
            <label>
              {t.baladia} <span className="required-mark">*</span>
              <input required value={customer.baladia} onChange={event => setCustomer({ ...customer, baladia: event.target.value })} />
              {fieldErrors.baladia && <span className="field-error">{fieldErrors.baladia}</span>}
            </label>
            <label className="checkout-full">
              {t.deliveryAddress}
              <textarea rows={4} value={customer.address} onChange={event => setCustomer({ ...customer, address: event.target.value })} />
              {fieldErrors.address && <span className="field-error">{fieldErrors.address}</span>}
            </label>
            <div className="payment-line">
              <span>{t.paymentMethod}</span>
              <strong>{t.cashOnDelivery}</strong>
            </div>
            {error && <p className="checkout-error">{error}</p>}
          </div>

          <aside className="order-summary">
            <h2>{t.finalTotal}</h2>
            <div><span>{t.items}</span><strong>{items.length}</strong></div>
            <div><span>{t.subtotal}</span><strong>{formatDzd(subtotal)}</strong></div>
            <div><span>{t.delivery}</span><strong>{formatDzd(deliveryCost)}</strong></div>
            <div className="summary-total"><span>{t.total}</span><strong>{formatDzd(total)}</strong></div>
            <button className="order-primary" type="submit" disabled={submitting || !customer.wilaya || !customer.deliveryMethod}>
              {submitting && <Loader2 className="spin-icon" size={18} />}
              {t.confirmOrder}
            </button>
          </aside>
        </form>
      )}
    </section>
  );
}
