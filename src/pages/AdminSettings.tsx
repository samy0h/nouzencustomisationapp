import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/admin.css';

export default function AdminSettings() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [productTypes, setProductTypes] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    loadProductTypes();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getProducts({ limit: 100, active: true });
      const uniqueCategories = [...new Map(
        response.data.products.map(p => [p.category.id, p.category])
      ).values()];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Could not load categories.');
    }
  };

  const loadProductTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product-types');
      const data = await response.json();
      setProductTypes(data.data.productTypes);
    } catch (err) {
      setError('Could not load product types.');
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required.');
      return;
    }
    try {
      const slug = newCategoryName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), slug }),
      });

      setNewCategoryName('');
      setMessage('Category created successfully.');
      setError('');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create category.');
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Delete category "${categoryName}"? Products in this category will need to be reassigned.`)) {
      return;
    }
    try {
      await fetch(`http://localhost:3001/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      setMessage('Category deleted successfully.');
      setError('');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete category.');
    }
  };

  const createProductType = async () => {
    if (!newTypeName.trim()) {
      setError('Product type name is required.');
      return;
    }
    try {
      const slug = newTypeName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      await fetch('http://localhost:3001/api/product-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName.trim(), slug }),
      });

      setNewTypeName('');
      setMessage('Product type created successfully.');
      setError('');
      await loadProductTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create product type.');
    }
  };

  const deleteProductType = async (typeId: string, typeName: string) => {
    if (!window.confirm(`Delete product type "${typeName}"? Products using this type will need to be reassigned.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/product-types/${typeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete product type.');
      }

      setMessage('Product type deleted successfully.');
      setError('');
      await loadProductTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete product type.');
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <Link to="/admin" className="admin-back">← Back to products</Link>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ADMIN SETTINGS</span>
            <h1>Categories & Types</h1>
            <p>Manage product categories and types for your store.</p>
          </div>
        </header>
        {message && <p className="admin-message">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Categories Section */}
          <section className="admin-panel">
            <h2>Categories</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'grid', gap: '.4rem', color: '#6d6259', fontSize: '.78rem', fontWeight: 600 }}>
                New category name
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., T-Shirts"
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  />
                  <button className="admin-secondary" onClick={createCategory}>
                    Add Category
                  </button>
                </div>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '.75rem 1rem',
                    background: '#f7f4f0',
                    border: '1px solid #e5ddd5',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>{category.name}</strong>
                    <span style={{ color: '#766c64', fontSize: '.75rem', marginLeft: '.5rem' }}>
                      ({category.slug})
                    </span>
                  </div>
                  <button
                    className="admin-danger"
                    onClick={() => deleteCategory(category.id, category.name)}
                    style={{ padding: '.4rem .7rem', fontSize: '.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p style={{ color: '#877b72', fontSize: '.85rem', textAlign: 'center', padding: '2rem' }}>
                  No categories yet. Add one above.
                </p>
              )}
            </div>
          </section>

          {/* Product Types Section */}
          <section className="admin-panel">
            <h2>Product Types</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'grid', gap: '.4rem', color: '#6d6259', fontSize: '.78rem', fontWeight: 600 }}>
                New product type
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    placeholder="e.g., T-Shirt"
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  />
                  <button className="admin-secondary" onClick={createProductType}>
                    Add Type
                  </button>
                </div>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {productTypes.map((type) => (
                <div
                  key={type.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '.75rem 1rem',
                    background: '#f7f4f0',
                    border: '1px solid #e5ddd5',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '.9rem' }}>{type.name}</strong>
                    <span style={{ color: '#766c64', fontSize: '.75rem', marginLeft: '.5rem' }}>
                      ({type.slug})
                    </span>
                  </div>
                  <button
                    className="admin-danger"
                    onClick={() => deleteProductType(type.id, type.name)}
                    style={{ padding: '.4rem .7rem', fontSize: '.75rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {productTypes.length === 0 && (
                <p style={{ color: '#877b72', fontSize: '.85rem', textAlign: 'center', padding: '2rem' }}>
                  No product types yet. Add one above.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
