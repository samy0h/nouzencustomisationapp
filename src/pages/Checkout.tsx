import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';
import '../styles/orders.css';

export default function Checkout() {
  const navigate = useNavigate();

  return (
    <main className="order-page">
      <section className="order-shell">
        <OrderForm onBack={() => navigate('/cart')} />
      </section>
    </main>
  );
}
