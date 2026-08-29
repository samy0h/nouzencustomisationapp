import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, ExternalLink, Save, Trash2 } from 'lucide-react';
import { api, apiBaseUrl } from '../services/api';
import type { ApiOrder, OrderStatus } from '../types';
import '../styles/admin.css';

const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const formatDzd = (value: number) => `${value.toLocaleString()} DZD`;
const fileHref = (url: string | null) => url ? `${apiBaseUrl}${url}` : '';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const form = useMemo(() => ({
    customerName: order?.customerName ?? '',
    phone: order?.phone ?? '',
    wilaya: order?.wilaya ?? '',
    baladia: order?.baladia ?? '',
    address: order?.address ?? '',
    deliveryCost: order?.deliveryCost ?? 0,
    items: order?.items.map(item => ({ id: item.id, quantity: item.quantity })) ?? [],
  }), [order]);
  const [draft, setDraft] = useState(form);

  useEffect(() => {
    if (!id) return;
    api.getOrder(id)
      .then(response => {
        setOrder(response.data.order);
        setError('');
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not load order.'));
  }, [id]);

  useEffect(() => setDraft(form), [form]);

  const saveOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (!order) return;
    try {
      const response = await api.updateOrder(order.id, draft);
      setOrder(response.data.order);
      setMessage('Order saved.');
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save order.');
    }
  };

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;
    try {
      const response = await api.updateOrderStatus(order.id, { status, cancellationReason });
      setOrder(response.data.order);
      setMessage('Status updated.');
      setError('');
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update status.');
    }
  };

  const removeItem = async (itemId: string) => {
    if (!order) return;
    if (!window.confirm('Remove this item from the order? This cannot be undone.')) return;
    try {
      const response = await api.deleteOrderItem(order.id, itemId);
      setOrder(response.data.order);
      setMessage('Item removed.');
      setError('');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove item.');
    }
  };

  if (!order) {
    return (
      <main className="admin-page">
        <div className="admin-shell">
          <Link to="/admin/orders" className="admin-back">Back to orders</Link>
          {error ? <p className="admin-error">{error}</p> : <p className="admin-help">Loading order...</p>}
        </div>
      </main>
    );
  }

  const timeline = [
    ['Order received', order.createdAt],
    ['Confirmed', order.confirmedAt],
    ['Processing', order.processingAt],
    ['Shipped', order.shippedAt],
    ['Delivered', order.deliveredAt],
    ['Cancelled', order.cancelledAt],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <nav className="admin-top-links">
          <Link to="/admin/orders" className="admin-back">Back to orders</Link>
          <Link to="/admin/dashboard" className="admin-back">Dashboard</Link>
        </nav>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ORDER DETAILS</span>
            <h1>{order.orderNumber}</h1>
            <p>{order.customerName} / {formatDzd(order.total)} / Cash on Delivery</p>
          </div>
        </header>
        {message && <p className="admin-message">{message}</p>}
        {error && <p className="admin-error">{error}</p>}

        <form className="admin-order-grid" onSubmit={saveOrder}>
          <section className="admin-panel">
            <h2>Customer</h2>
            <div className="admin-create-grid">
              <label>Name<input value={draft.customerName} onChange={event => setDraft({ ...draft, customerName: event.target.value })} /></label>
              <label>Phone<input value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })} /></label>
              <label>Wilaya<input value={draft.wilaya} onChange={event => setDraft({ ...draft, wilaya: event.target.value })} /></label>
              <label>Baladia<input value={draft.baladia} onChange={event => setDraft({ ...draft, baladia: event.target.value })} /></label>
              <label>Delivery<input type="number" min="0" value={draft.deliveryCost} onChange={event => setDraft({ ...draft, deliveryCost: Number(event.target.value) })} /></label>
            </div>
            <label className="admin-description-field">Address<textarea rows={3} value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })} /></label>
            <button className="admin-save" type="submit"><Save size={16} /> Save order</button>
          </section>

          <section className="admin-panel">
            <h2>Status</h2>
            <div className="admin-status-grid">
              {statuses.map(status => (
                <button key={status} type="button" className={order.status === status ? 'selected' : ''} onClick={() => changeStatus(status)}>
                  {status}
                </button>
              ))}
            </div>
            <label className="admin-description-field">Cancellation reason<textarea rows={3} value={cancellationReason} onChange={event => setCancellationReason(event.target.value)} /></label>
          </section>

          <section className="admin-panel">
            <h2>Timeline</h2>
            <ol className="order-timeline">
              {timeline.map(([label, value]) => <li key={label}><strong>{label}</strong><span>{new Date(value).toLocaleString()}</span></li>)}
            </ol>
          </section>

          <section className="admin-panel admin-order-items">
            <h2>Items</h2>
            {order.items.map((item, index) => (
              <article className="admin-order-item" key={item.id}>
                 <div>
                   <h3>{item.productNameSnapshot}</h3>
                   <p>{item.color} / {item.size} / {item.fit}</p>
                   <p>{formatDzd(item.unitPriceSnapshot)} x {item.quantity} = {formatDzd(item.unitPriceSnapshot * item.quantity)}</p>
                   <label>Quantity<input type="number" min="1" value={draft.items[index]?.quantity ?? item.quantity} onChange={event => {
                     const items = [...draft.items];
                     items[index] = { id: item.id, quantity: Number(event.target.value) };
                     setDraft({ ...draft, items });
                   }} /></label>
                   <button type="button" className="admin-remove-item" onClick={() => removeItem(item.id)}>
                     <Trash2 size={14} /> Remove item
                   </button>
                 </div>
                <div className="admin-file-links">
                  {[
                    ['Front mockup', item.mockupFrontUrl],
                    ['Back mockup', item.mockupBackUrl],
                    ['Front design', item.designFrontUrl],
                    ['Back design', item.designBackUrl],
                    ['Customization JSON', item.customizationJsonUrl],
                  ].map(([label, url]) => url && (
                    <span key={label}>
                      <a href={fileHref(url)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View {label}</a>
                      <a href={fileHref(url)} download><Download size={14} /> Download {label}</a>
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section className="admin-panel">
            <h2>Payment and totals</h2>
            <div className="admin-totals">
              <div><span>Payment</span><strong>COD</strong></div>
              <div><span>Subtotal</span><strong>{formatDzd(order.subtotal)}</strong></div>
              <div><span>Delivery</span><strong>{formatDzd(order.deliveryCost)}</strong></div>
              <div><span>Total</span><strong>{formatDzd(order.total)}</strong></div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
