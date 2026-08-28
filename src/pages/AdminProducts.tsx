import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiProduct } from '../types';
import '../styles/admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => api.getProducts({ limit: 100, active: true }).then(response => setProducts(response.data.products)).catch(() => setError('Could not load products. Start the API server first.'));
  const archiveProduct = async (event: MouseEvent, productId: string) => { event.preventDefault(); event.stopPropagation(); if (!window.confirm('Archive this product? It will disappear from the shop but existing orders stay safe.')) return; try { await api.deleteAdminProduct(productId); await loadProducts(); } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Could not archive product.'); } };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/catalog" className="admin-back">← Back to shop</Link>
          <Link to="/admin/settings" className="admin-back">⚙️ Settings</Link>
        </div>
        <header className="admin-header">
          <div><span className="admin-eyebrow">PRODUCT STUDIO</span><h1>Choose a product to edit</h1><p>Manage mockup images, color variants, and printable areas.</p></div>
          <Link to="/admin/products/new" className="admin-save">+ New product</Link>
        </header>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-product-list">
          {products.map(product => <Link className="admin-product-card" key={product.id} to={`/admin/products/${product.id}`}><div className="admin-product-thumb"><img src={product.images[0]} alt="" /></div><div><h2>{product.name}</h2><p>{product.variants.length} variants</p></div><button className="admin-card-delete" onClick={event => archiveProduct(event, product.id)} aria-label={`Archive ${product.name}`}>×</button><span>→</span></Link>)}
        </div>
      </div>
    </main>
  );
}
