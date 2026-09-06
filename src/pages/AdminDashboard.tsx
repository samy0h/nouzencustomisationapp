import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { DashboardStats, OrderStatus } from '../types';
import { useAdminAuth } from '../hooks/useAdminAuth';
import '../styles/admin.css';

const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const formatDzd = (value: number) => `${Math.round(value).toLocaleString()} DZD`;

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const { logout, getUsername } = useAdminAuth();

  useEffect(() => {
    api.getDashboardStats()
      .then(response => {
        setStats(response.data);
        setError('');
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not load dashboard.'));
  }, []);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <nav className="admin-top-links">
          <Link to="/admin" className="admin-back">Products</Link>
          <Link to="/admin/orders" className="admin-back">Orders</Link>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#666' }}>👤 {getUsername()}</span>
            <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
          </div>
        </nav>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">DASHBOARD</span>
            <h1>Financial analytics</h1>
            <p>Revenue is calculated from non-cancelled confirmed workflow orders, using stored order totals.</p>
          </div>
        </header>

        {error && <p className="admin-error">{error}</p>}
        {!stats ? <p className="admin-help">Loading dashboard...</p> : (
          <>
            <section className="dashboard-cards">
              <article><span>Total revenue</span><strong>{formatDzd(stats.totalRevenue)}</strong></article>
              <article><span>Today</span><strong>{formatDzd(stats.todayRevenue)}</strong></article>
              <article><span>This week</span><strong>{formatDzd(stats.weekRevenue)}</strong></article>
              <article><span>This month</span><strong>{formatDzd(stats.monthRevenue)}</strong></article>
              <article><span>Total orders</span><strong>{stats.totalOrders}</strong></article>
              <article><span>Items sold</span><strong>{stats.itemsSold}</strong></article>
              <article><span>Average order value</span><strong>{formatDzd(stats.averageOrderValue)}</strong></article>
            </section>

            <section className="admin-dashboard-grid">
              <div className="admin-panel">
                <h2>Orders by status</h2>
                <div className="status-list">
                  {statuses.map(status => <div key={status}><span>{status}</span><strong>{stats.statusCounts[status] ?? 0}</strong></div>)}
                </div>
              </div>
              <div className="admin-panel">
                <h2>Revenue and orders over time</h2>
                <div className="chart-bars">
                  {stats.ordersByDay.map(day => (
                    <div key={day.date} title={`${day.date}: ${day.orders} orders, ${formatDzd(day.revenue)}`}>
                      <span style={{ height: `${Math.max(8, Math.min(100, day.revenue / 1000))}%` }} />
                      <small>{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-panel">
                <h2>Top products</h2>
                <div className="status-list">
                  {stats.topProducts.map(product => <div key={product.product}><span>{product.product}</span><strong>{product.quantity}</strong></div>)}
                </div>
              </div>
              <div className="admin-panel">
                <h2>Recent orders</h2>
                <div className="recent-orders">
                  {stats.recentOrders.map(order => (
                    <Link to={`/admin/orders/${order.id}`} key={order.id}>
                      <span>{order.orderNumber}</span>
                      <span>{order.customerName}</span>
                      <strong>{formatDzd(order.total)}</strong>
                      <em>{order.status}</em>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
