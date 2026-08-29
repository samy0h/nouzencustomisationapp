import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ApiOrdersResponse, OrderStatus } from '../types';
import '../styles/admin.css';

const statuses: Array<OrderStatus | ''> = ['', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const formatDzd = (value: number) => `${value.toLocaleString()} DZD`;

export default function AdminOrders() {
  const [orders, setOrders] = useState<ApiOrdersResponse['data']['orders']>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [wilaya, setWilaya] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'total'>('newest');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadOrders = () => {
    api.getOrders({ search, status, wilaya, sort, limit: 20, offset })
      .then(response => {
        setOrders(response.data.orders);
        setTotal(response.data.pagination.total);
        setError('');
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not load orders.'));
  };

  useEffect(() => {
    loadOrders();
  }, [search, status, wilaya, sort, offset]);

  const removeOrder = async (event: MouseEvent, orderId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm('Delete this order permanently? This cannot be undone.')) return;

    try {
      await api.deleteOrder(orderId);
      setMessage('Order deleted.');
      loadOrders();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete order.');
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <nav className="admin-top-links">
          <Link to="/admin" className="admin-back">Products</Link>
          <Link to="/admin/dashboard" className="admin-back">Dashboard</Link>
        </nav>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ORDERS</span>
            <h1>Order management</h1>
            <p>Search, filter, and open complete COD order records.</p>
          </div>
        </header>
        <section className="admin-panel admin-filters">
          <input placeholder="Order, customer, phone" value={search} onChange={event => { setOffset(0); setSearch(event.target.value); }} />
          <select value={status} onChange={event => { setOffset(0); setStatus(event.target.value as OrderStatus | ''); }}>
            {statuses.map(option => <option key={option || 'ALL'} value={option}>{option || 'All statuses'}</option>)}
          </select>
          <input placeholder="Wilaya" value={wilaya} onChange={event => { setOffset(0); setWilaya(event.target.value); }} />
          <select value={sort} onChange={event => setSort(event.target.value as 'newest' | 'oldest' | 'total')}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="total">Total</option>
          </select>
        </section>
        {error && <p className="admin-error">{error}</p>}
        {message && <p className="admin-message">{message}</p>}
        <section className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Wilaya</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} onClick={() => window.location.assign(`/admin/orders/${order.id}`)}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.phone}</td>
                  <td>{order.wilaya}</td>
                  <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td>{formatDzd(order.total)}</td>
                  <td><span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td><button className="admin-card-delete" onClick={event => removeOrder(event, order.id)} aria-label={`Delete ${order.orderNumber}`}>x</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pagination">
            <button className="admin-secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))}>Previous</button>
            <span>{Math.min(offset + 1, total)}-{Math.min(offset + 20, total)} of {total}</span>
            <button className="admin-secondary" disabled={offset + 20 >= total} onClick={() => setOffset(offset + 20)}>Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}
