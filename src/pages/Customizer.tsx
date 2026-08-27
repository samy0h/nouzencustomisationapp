import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Customizer() {
  const location = useLocation();
  const { t } = useLanguage();
  const state = location.state;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Customizer - Coming Soon
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        This is where the Fabric.js editor will be implemented.
      </p>

      {state && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          maxWidth: '500px',
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Selected Configuration:</h2>
          <div style={{ textAlign: 'left', fontSize: '0.875rem' }}>
            <p><strong>Product:</strong> {state.productName}</p>
            <p><strong>Color:</strong> {state.color}</p>
            <p><strong>Size:</strong> {state.size}</p>
            <p><strong>Quantity:</strong> {state.quantity}</p>
            {state.printingSide && (
              <p><strong>Printing Side:</strong> {state.printingSide}</p>
            )}
            <p><strong>Price:</strong> {state.price} DZD</p>
          </div>
        </div>
      )}

      <Link
        to={`/custom/product/${state?.productSlug || ''}`}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--burgundy, #A00223)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
        }}
      >
        {t.backToCatalog}
      </Link>
    </div>
  );
}
