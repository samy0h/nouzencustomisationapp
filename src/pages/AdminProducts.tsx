import { useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiProduct } from '../types';
import '../styles/admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', price: '', categoryId: '', type: 'OTHER', color: '', colorHex: '#111111', sizes: ['S'] });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => api.getProducts({ limit: 100, active: true }).then(response => setProducts(response.data.products)).catch(() => setError('Could not load products. Start the API server first.'));
  const categories = useMemo(() => [...new Map(products.map(product => [product.category.id, product.category])).values()], [products]);
  const setField = (field: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [field]: value }));
  const toggleSize = (size: string) => setForm(previous => ({ ...previous, sizes: previous.sizes.includes(size) ? previous.sizes.filter(value => value !== size) : [...previous.sizes, size] }));
  const createProduct = async () => {
    if (!form.name || !form.slug || !form.price || !form.categoryId || !form.color || !form.sizes.length) { setError('Complete the product details and choose at least one size.'); return; }
    try { await api.createAdminProduct({ name: form.name, slug: form.slug, price: Number(form.price), categoryId: form.categoryId, type: form.type, variants: [{ color: form.color, colorHex: form.colorHex, sizes: form.sizes }] }); setForm({ name: '', slug: '', price: '', categoryId: '', type: 'OTHER', color: '', colorHex: '#111111', sizes: ['S'] }); setShowCreate(false); setError(''); await loadProducts(); } catch (createError) { setError(createError instanceof Error ? createError.message : 'Could not create product.'); }
  };
  const archiveProduct = async (event: MouseEvent, productId: string) => { event.preventDefault(); event.stopPropagation(); if (!window.confirm('Archive this product? It will disappear from the shop but existing orders stay safe.')) return; try { await api.deleteAdminProduct(productId); await loadProducts(); } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Could not archive product.'); } };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <Link to="/catalog" className="admin-back">← Back to shop</Link>
        <header className="admin-header">
          <div><span className="admin-eyebrow">PRODUCT STUDIO</span><h1>Choose a product to edit</h1><p>Manage mockup images, color variants, and printable areas.</p></div>
          <button className="admin-save" onClick={() => setShowCreate(previous => !previous)}>{showCreate ? 'Close' : '+ New product'}</button>
        </header>
        {error && <p className="admin-error">{error}</p>}
        {showCreate && <section className="admin-panel admin-create-panel"><h2>Create a product</h2><div className="admin-create-grid"><label>Product name<input value={form.name} onChange={event => setField('name', event.target.value)} placeholder="Classic hoodie" /></label><label>URL slug<input value={form.slug} onChange={event => setField('slug', event.target.value)} placeholder="classic-hoodie" /></label><label>Price<input type="number" min="0" value={form.price} onChange={event => setField('price', event.target.value)} placeholder="2500" /></label><label>Category<select value={form.categoryId} onChange={event => setField('categoryId', event.target.value)}><option value="">Choose category</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Type<select value={form.type} onChange={event => setField('type', event.target.value)}>{['TSHIRT', 'HOODIE', 'POLO', 'JOGGER', 'TOTE_BAG', 'CAP', 'OTHER'].map(type => <option key={type}>{type}</option>)}</select></label><label>First color name<input value={form.color} onChange={event => setField('color', event.target.value)} placeholder="Black" /></label><label>Color hex<input type="color" value={form.colorHex} onChange={event => setField('colorHex', event.target.value)} /></label></div><h3>Initial sizes</h3><div className="variant-checks">{['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(size => <label key={size}><input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} />{size}</label>)}</div><button className="admin-secondary" onClick={createProduct}>Create product</button></section>}
        <div className="admin-product-list">
          {products.map(product => <Link className="admin-product-card" key={product.id} to={`/admin/products/${product.id}`}><div className="admin-product-thumb"><img src={product.images[0]} alt="" /></div><div><h2>{product.name}</h2><p>{product.variants.length} variants</p></div><button className="admin-card-delete" onClick={event => archiveProduct(event, product.id)} aria-label={`Archive ${product.name}`}>×</button><span>→</span></Link>)}
        </div>
      </div>
    </main>
  );
}
