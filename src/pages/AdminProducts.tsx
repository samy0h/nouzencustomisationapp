import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiProduct } from '../types';
import '../styles/admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProducts({ limit: 100, active: true }).then(response => setProducts(response.data.products)).catch(() => setError('Could not load products. Start the API server first.'));
  }, []);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <Link to="/catalog" className="admin-back">← Back to shop</Link>
        <header className="admin-header">
          <div><span className="admin-eyebrow">PRODUCT STUDIO</span><h1>Choose a product to edit</h1><p>Manage mockup images, color variants, and printable areas.</p></div>
        </header>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-product-list">
          {products.map(product => <Link className="admin-product-card" key={product.id} to={`/admin/products/${product.id}`}><div className="admin-product-thumb"><img src={product.images[0]} alt="" /></div><div><h2>{product.name}</h2><p>{product.variants.length} variants</p></div><span>→</span></Link>)}
        </div>
      </div>
    </main>
  );
}
