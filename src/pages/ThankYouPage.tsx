import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/thankyou.css';

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const number = searchParams.get('order');
    const amount = searchParams.get('total');

    if (number) setOrderNumber(number);
    if (amount) setTotal(parseInt(amount));
  }, [searchParams]);

  return (
    <div className="thankyou-page">
      <div className="thankyou-container">
        <div className="thankyou-icon">
          <CheckCircle2 size={80} strokeWidth={1.5} />
        </div>

        <h1 className="thankyou-title">
          {t.orderConfirmed || 'Commande Confirmée!'}
        </h1>

        {orderNumber && (
          <div className="order-details">
            <p className="order-number">
              Numéro de commande: <strong>#{orderNumber}</strong>
            </p>
            {total > 0 && (
              <p className="order-total">
                {t.total || 'Total'}: <strong>{total.toLocaleString()} DZD</strong>
              </p>
            )}
          </div>
        )}

        <div className="thankyou-message">
          <p>Merci pour votre commande! Nous vous contacterons bientôt pour confirmer les détails de votre commande.</p>
          <p>{t.paymentMethod || 'Mode de paiement'}: <strong>{t.cashOnDelivery || 'Paiement à la livraison'}</strong></p>
        </div>

        <div className="thankyou-actions">
          <Link to="/catalog" className="btn-primary">
            Continuer vos achats
          </Link>
        </div>

        <div className="contact-info">
          <p className="contact-text">
            Des questions? Contactez-nous: <a href="tel:+213660617267">0660 617 267</a>
          </p>
        </div>
      </div>
    </div>
  );
}
