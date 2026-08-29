import { Link, useNavigate } from 'react-router-dom';
import { Minus, PenLine, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { useCart } from '../stores/cartStore';
import '../styles/orders.css';

const formatDzd = (value: number) => `${value.toLocaleString()} DZD`;

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryCost, total, updateQuantity, removeItem } = useCart();

  return (
    <main className="order-page">
      <section className="order-shell">
        <header className="order-header">
          <Link to="/catalog" className="order-back">Back to catalog</Link>
          <div>
            <span className="order-eyebrow">Cart</span>
            <h1>Your customized items</h1>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBasket size={40} />
            <h2>Your cart is empty</h2>
            <Link className="order-primary-link" to="/catalog">Continue customizing</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map(item => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-thumb">
                    <img src={item.productImage} alt="" />
                    {(item.designFrontDataUrl || item.designBackDataUrl) && (
                      <img className="cart-design-layer" src={item.designFrontDataUrl || item.designBackDataUrl || ''} alt="" />
                    )}
                  </div>
                  <div className="cart-item-main">
                    <h2>{item.productName}</h2>
                    <p>{item.color} / {item.size} / {item.fit}</p>
                    <p>{formatDzd(item.unitPrice)} each</p>
                    <div className="cart-actions">
                      <Link to={`/custom/product/${item.productSlug}`} className="cart-icon-btn" title="Edit customization">
                        <PenLine size={16} />
                      </Link>
                      <button className="cart-icon-btn" onClick={() => removeItem(item.id)} title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <strong>{formatDzd(item.unitPrice * item.quantity)}</strong>
                </article>
              ))}
            </div>

            <aside className="order-summary">
              <h2>Order summary</h2>
              <div><span>Subtotal</span><strong>{formatDzd(subtotal)}</strong></div>
              <div><span>Delivery</span><strong>{formatDzd(deliveryCost)}</strong></div>
              <div className="summary-total"><span>Total</span><strong>{formatDzd(total)}</strong></div>
              <button className="order-primary" onClick={() => navigate('/checkout')}>Order now</button>
              <Link className="order-secondary" to="/catalog">Continue customizing</Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
