import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const currency = (amount: number) => `$${amount.toFixed(2)}`;

export default function CartOrderSummary() {
  const { subtotal, discount, shipping, total, items } = useCart();
  const { darkMode } = useTheme();
  const [message, setMessage] = useState('');
  const panelClass = darkMode
    ? 'border-gray-700 bg-gray-800 text-light'
    : 'border-gray-200 bg-white text-gray-800';

  return (
    <aside
      className={`h-fit overflow-hidden rounded-xl border shadow-sm ${panelClass}`}
      aria-labelledby="order-summary-title"
    >
      <h2
        id="order-summary-title"
        className="border-b border-gray-600/30 px-5 py-4 text-center text-2xl font-bold"
      >
        Order Summary
      </h2>
      <dl className="divide-y divide-gray-600/30">
        <div className="flex items-center justify-between px-5 py-3">
          <dt className="font-semibold">Subtotal</dt>
          <dd>{currency(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <dt className="font-semibold">Discount (5%)</dt>
          <dd>-{currency(discount)}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <dt className="font-semibold">Shipping</dt>
          <dd>{currency(shipping)}</dd>
        </div>
        <div className="flex items-center justify-between px-5 py-3 text-lg font-bold">
          <dt>Grand Total</dt>
          <dd>{currency(total)}</dd>
        </div>
      </dl>
      <div className="p-4">
        <button
          type="button"
          onClick={() =>
            setMessage('Checkout is not available yet. Your cart is saved.')
          }
          disabled={items.length === 0}
          className="w-full rounded-full bg-gradient-to-r from-primary to-lime-500 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Proceed To Checkout
        </button>
        {message && (
          <p className="mt-3 text-center text-sm" role="status">
            {message}
          </p>
        )}
      </div>
    </aside>
  );
}
