import { useLanguage } from '../contexts/LanguageContext';

export const CartButton = () => {
  const { t } = useLanguage();

  return (
    <button className="cart-btn">
      <svg className="cart-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
      </svg>
      <span>{t.cartText}</span>
      <span className="cart-badge">0</span>
    </button>
  );
};
