import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { ApiOrder } from '../types';
import '../styles/orders.css';

const formatDzd = (value: number) => `${value.toLocaleString()} DZD`;

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const location = useLocation();
  const order = (location.state as { order?: ApiOrder } | null)?.order;

  if (!order) {
    // No order in navigation state (e.g. page refresh) — back to catalog
    return <Navigate to="/catalog" replace />;
  }

  return (
    <section className="order-shell">
      <div className="confirmation">
        <CheckCircle2 size={44} />
        <span className="order-eyebrow">{t.orderConfirmed}</span>
        <h1>{t.thankYou}</h1>
        <p className="confirmation-order-id">#{order.orderNumber}</p>
        <p>{t.total}: {formatDzd(order.total)}</p>
        <p>{t.paymentMethod}: {t.cashOnDelivery}</p>
        <p>{t.orderFollowUp}</p>
        <Link className="order-primary-link" to="/catalog">{t.backToCatalog}</Link>
      </div>
    </section>
  );
}
