import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import CartOrderSummary from './CartOrderSummary';

const currency = (amount: number) => `$${amount.toFixed(2)}`;

export default function Cart() {
  const { items, setItemQuantity, removeItem } = useCart();
  const { darkMode } = useTheme();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [message, setMessage] = useState('');
  const panelClass = darkMode
    ? 'border-gray-700 bg-gray-800 text-light'
    : 'border-gray-200 bg-white text-gray-800';
  const rowClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  const updateCart = () => {
    items.forEach((item) => {
      setItemQuantity(item.productId, quantities[item.productId] ?? item.quantity);
    });
    setQuantities({});
    setMessage('Cart updated.');
  };

  const handleRemove = (productId: number, name: string) => {
    removeItem(productId);
    setQuantities((current) => {
      const updated = { ...current };
      delete updated[productId];
      return updated;
    });
    setMessage(`${name} removed from your cart.`);
  };

  return (
    <div
      className={`min-h-screen px-4 pb-16 pt-24 transition-colors duration-300 ${
        darkMode ? 'bg-dark text-light' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <main className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
        {items.length === 0 ? (
          <section className={`rounded-xl border p-10 text-center shadow-sm ${panelClass}`}>
            <p className="mb-5 text-lg">Your cart is empty.</p>
            <Link
              to="/products"
              className="inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-accent"
            >
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section
              className={`overflow-hidden rounded-xl border shadow-sm ${panelClass}`}
              aria-label="Cart items"
            >
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-center">
                  <thead>
                    <tr className={`${rowClass} border-b`}>
                      {['S. No.', 'Product Image', 'Product Name', 'Unit Price', 'Quantity', 'Total', 'Remove'].map(
                        (heading) => (
                          <th key={heading} scope="col" className={`px-3 py-3 font-semibold ${rowClass} border-r last:border-r-0`}>
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const unitPrice = item.price * (1 - (item.discount ?? 0));
                      return (
                        <tr key={item.productId} className={`${rowClass} border-b last:border-b-0`}>
                          <td className={`border-r px-4 py-5 font-semibold ${rowClass}`}>{index + 1}</td>
                          <td className={`border-r px-3 py-2 ${rowClass}`}>
                            <img
                              src={`/${item.imgName}`}
                              alt={item.name}
                              className="mx-auto h-20 w-24 object-contain"
                            />
                          </td>
                          <td className={`border-r px-4 py-5 font-semibold ${rowClass}`}>{item.name}</td>
                          <td className={`border-r px-4 py-5 font-semibold ${rowClass}`}>{currency(unitPrice)}</td>
                          <td className={`border-r px-3 py-5 ${rowClass}`}>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              aria-label={`Quantity of ${item.name}`}
                              value={quantities[item.productId] ?? item.quantity}
                              onChange={(event) =>
                                setQuantities((current) => ({
                                  ...current,
                                  [item.productId]: Math.max(1, Number(event.target.value) || 1),
                                }))
                              }
                              className={`w-16 rounded-lg border px-2 py-2 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                                darkMode
                                  ? 'border-gray-600 bg-gray-800 text-light'
                                  : 'border-gray-300 bg-white text-gray-800'
                              }`}
                            />
                          </td>
                          <td className={`border-r px-4 py-5 font-semibold ${rowClass}`}>
                            {currency(unitPrice * (quantities[item.productId] ?? item.quantity))}
                          </td>
                          <td className="px-3 py-5">
                            <button
                              type="button"
                              onClick={() => handleRemove(item.productId, item.name)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="rounded p-2 text-primary hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-gray-600/30 md:hidden">
                {items.map((item) => {
                  const unitPrice = item.price * (1 - (item.discount ?? 0));
                  return (
                    <article key={item.productId} className="flex gap-4 p-4">
                      <img src={`/${item.imgName}`} alt={item.name} className="h-20 w-20 shrink-0 object-contain" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-2">
                          <h2 className="font-semibold">{item.name}</h2>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.productId, item.name)}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-primary hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="mt-1 text-sm">{currency(unitPrice)} each</p>
                        <div className="mt-3 flex items-center justify-between">
                          <label className="text-sm" htmlFor={`mobile-quantity-${item.productId}`}>
                            Quantity
                          </label>
                          <input
                            id={`mobile-quantity-${item.productId}`}
                            type="number"
                            min="1"
                            step="1"
                            value={quantities[item.productId] ?? item.quantity}
                            onChange={(event) =>
                              setQuantities((current) => ({
                                ...current,
                                [item.productId]: Math.max(1, Number(event.target.value) || 1),
                              }))
                            }
                            className={`w-16 rounded-lg border px-2 py-1 text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                              darkMode
                                ? 'border-gray-600 bg-gray-800 text-light'
                                : 'border-gray-300 bg-white text-gray-800'
                            }`}
                          />
                          <span className="font-semibold">
                            {currency(unitPrice * (quantities[item.productId] ?? item.quantity))}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className={`flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between ${rowClass}`}>
                <form
                  className="flex w-full max-w-md overflow-hidden rounded-full border border-gray-600/40"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setMessage('Coupon codes are not available yet.');
                  }}
                >
                  <label className="sr-only" htmlFor="cart-coupon">Coupon code</label>
                  <input
                    id="cart-coupon"
                    type="text"
                    placeholder="Coupon Code"
                    className={`min-w-0 flex-1 bg-transparent px-4 py-3 outline-none ${
                      darkMode ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-primary px-4 py-3 font-semibold text-white hover:bg-accent"
                  >
                    Apply Coupon
                  </button>
                </form>
                <button
                  type="button"
                  onClick={updateCart}
                  className="shrink-0 rounded-full bg-gradient-to-r from-primary to-lime-500 px-6 py-3 font-semibold text-white hover:opacity-90"
                >
                  Update Cart
                </button>
              </div>
              {message && (
                <p className="px-4 pb-4 text-sm" role="status" aria-live="polite">
                  {message}
                </p>
              )}
            </section>
            <CartOrderSummary />
          </div>
        )}
      </main>
    </div>
  );
}
