import { money, lineTotal } from './Layout';
import { SHOP } from '../printer/escpos';

// Hidden on screen; shown only when printing (see .receipt-print in index.css).
// Sized for a 58mm thermal roll.
export default function Receipt({ order, items, customer }) {
  const hasCustomer = customer && (customer.name || customer.mobile || customer.email);
  return (
    <div className="receipt-print">
      <div style={{ textAlign: 'center' }}>
        <strong>{SHOP.name}</strong><br />
        {SHOP.tagline}<br />
        --------------------------------
      </div>
      <div>
        Order #: {order?.id ?? '—'}<br />
        {new Date(order?.created_at || Date.now()).toLocaleString()}
      </div>
      {hasCustomer && (
        <div>
          --------------------------------<br />
          {customer.name && <>Name: {customer.name}<br /></>}
          {customer.mobile && <>Mobile: {customer.mobile}<br /></>}
          {customer.email && <>Email: {customer.email}<br /></>}
        </div>
      )}
      <div>--------------------------------</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.name} {i.grams}g</td>
              <td style={{ textAlign: 'right' }}>{money(lineTotal(i.price, i.grams))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>--------------------------------</div>
      <table style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td style={{ textAlign: 'right' }}>
              <strong>{money(items.reduce((s, i) => s + lineTotal(i.price, i.grams), 0))}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        Thank you! Visit again
      </div>
    </div>
  );
}
