import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/admin.css';

export default function AdminSettings() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [productTypes, setProductTypes] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [changePasswordUsername, setChangePasswordUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
    loadProductTypes();
    loadUsers();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setCategories(data.data.categories);
    } catch (err) {
      setError('Could not load categories.');
    }
  };

  const loadProductTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/product-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
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

      const response = await fetch('http://localhost:3001/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim(), slug }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not create category.');
      }

      setNewCategoryName('');
      setMessage('Category created successfully.');
      setError('');
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create category.');
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Delete category "${categoryName}"?\n\nWARNING: This will also delete ALL products in this category. This cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/categories/${categoryId}?force=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete category.');
      }

      setMessage('Category and its products deleted successfully.');
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

      const response = await fetch('http://localhost:3001/api/product-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ name: newTypeName.trim(), slug }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not create product type.');
      }

      setNewTypeName('');
      setMessage('Product type created successfully.');
      setError('');
      await loadProductTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create product type.');
    }
  };

  const deleteProductType = async (typeId: string, typeName: string) => {
    if (!window.confirm(`Delete product type "${typeName}"?\n\nWARNING: This will also delete ALL products using this type. This cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/product-types/${typeId}?force=true`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete product type.');
      }

      setMessage('Product type and its products deleted successfully.');
      setError('');
      await loadProductTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete product type.');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setUsers(data.data.users);
    } catch (err) {
      setError('Could not load users.');
    }
  };

  const addUser = async () => {
    if (!newUsername.trim() || !newUserPassword.trim()) {
      setError('Username and password are required.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/auth/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ username: newUsername.trim(), password: newUserPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not add user.');
      }

      setNewUsername('');
      setNewUserPassword('');
      setMessage('User added successfully.');
      setError('');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add user.');
    }
  };

  const removeUser = async (username: string) => {
    if (!window.confirm(`Remove user "${username}"?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/auth/admin/users/${username}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not remove user.');
      }

      setMessage('User removed successfully.');
      setError('');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove user.');
    }
  };

  const changePassword = async () => {
    if (!changePasswordUsername || !newPassword.trim()) {
      setError('Username and new password are required.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/auth/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ username: changePasswordUsername, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not change password.');
      }

      setChangePasswordUsername('');
      setNewPassword('');
      setMessage('Password changed successfully.');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password.');
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <Link to="/admin" className="admin-back">← Back to products</Link>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ADMIN SETTINGS</span>
            <h1>Settings</h1>
            <p>Manage users, categories and types for your store.</p>
          </div>
        </header>
        {message && <p className="admin-message">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Users Section */}
          <section className="admin-panel">
            <h2>Admin Users</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'grid', gap: '.4rem', color: '#6d6259', fontSize: '.78rem', fontWeight: 600 }}>
                Add new user
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Username"
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  />
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Password"
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  />
                  <button className="admin-secondary" onClick={addUser}>
                    Add User
                  </button>
                </div>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {users.map((username) => (
                <div
                  key={username}
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
                  <strong style={{ fontSize: '.9rem' }}>{username}</strong>
                  <button
                    className="admin-danger"
                    onClick={() => removeUser(username)}
                    style={{ padding: '.4rem .7rem', fontSize: '.75rem' }}
                    disabled={users.length === 1}
                  >
                    {users.length === 1 ? 'Last User' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'grid', gap: '.4rem', color: '#6d6259', fontSize: '.78rem', fontWeight: 600 }}>
                Change password
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <select
                    value={changePasswordUsername}
                    onChange={(e) => setChangePasswordUsername(e.target.value)}
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  >
                    <option value="">Select user</option>
                    {users.map((username) => (
                      <option key={username} value={username}>{username}</option>
                    ))}
                  </select>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    style={{ flex: 1, border: '1px solid #d9d0c8', borderRadius: '7px', padding: '.65rem', background: '#fff', font: 'inherit' }}
                  />
                  <button className="admin-secondary" onClick={changePassword}>
                    Change
                  </button>
                </div>
              </label>
            </div>
          </section>

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
