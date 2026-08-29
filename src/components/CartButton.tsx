import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../stores/cartStore';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CartButton = () => {
  const { t } = useLanguage();
  const { itemCount } = useCart();

  return (
    <Link className="cart-btn" to="/cart">
      <ShoppingCart className="cart-icon" size={18} />
      <span>{t.cartText}</span>
      <span className="cart-badge">{itemCount}</span>
    </Link>
  );
};
