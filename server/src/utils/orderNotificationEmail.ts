import { Resend } from 'resend';

type OrderNotification = {
  orderNumber: string;
  customerName: string;
  wilaya: string;
  total: number;
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const sendOrderNotificationEmail = async (order: OrderNotification) => {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL || 'Nouzen Orders <onboarding@resend.dev>';

  console.log('[ORDER EMAIL] Sending notification...');
  console.log('[ORDER EMAIL] RESEND_API_KEY exists:', Boolean(apiKey));
  console.log('[ORDER EMAIL] From:', sender);
  console.log('[ORDER EMAIL] To:', recipient ?? '(not configured)');

  if (!apiKey || !recipient) {
    console.warn('[ORDER EMAIL] Skipped: RESEND_API_KEY and ORDER_NOTIFICATION_EMAIL are required.');
    return;
  }

  const resend = new Resend(apiKey);
  const subject = `New Order #${order.orderNumber}`;
  const text = `New Order Received\n\nOrder: #${order.orderNumber}\nCustomer: ${order.customerName}\nWilaya: ${order.wilaya}\nTotal: ${order.total} DZD\n\nA new order has been placed.\nOpen the Admin Dashboard to view the complete order details.`;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#111827">New Order Received</h1><p><strong>Order:</strong> #${escapeHtml(order.orderNumber)}</p><p><strong>Customer:</strong> ${escapeHtml(order.customerName)}</p><p><strong>Wilaya:</strong> ${escapeHtml(order.wilaya)}</p><p><strong>Total:</strong> ${order.total} DZD</p><p>A new order has been placed.</p><p>Open the Admin Dashboard to view the complete order details.</p></div>`;

  try {
    const { data, error } = await resend.emails.send({ from: sender, to: recipient, subject, text, html });
    if (error) {
      console.error('[ORDER EMAIL] Resend rejected notification:', error);
      return;
    }
    console.log('[ORDER EMAIL] Resend response:', data);
    console.log(`[ORDER EMAIL] Notification sent: ${data?.id ?? '(no Resend ID returned)'}`);
  } catch (error) {
    console.error(`[ORDER EMAIL] Failed to send notification for ${order.orderNumber}:`, error);
  }
};
