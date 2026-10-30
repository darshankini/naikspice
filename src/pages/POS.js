import { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { money } from '../components/Layout';
import CategoryList from '../components/CategoryList';
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';
import ErrorBoundary from '../components/ErrorBoundary';

export default function POS() {
  const { add, total, count } = useCart();
  const [cartOpen, setCartOpen] = useState(false); // mobile-only cart drawer
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(true);

  // Load categories + all products once.
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/products')])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);


  // Filter client-side so switching category is instant (no refetch).
  const visible = useMemo(
    () => (active === 'all' ? products : products.filter((p) => p.category_id === active)),
    [products, active]
  );

  const handleAdd = useCallback((p) => add(p), [add]);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Left: categories rail + product grid. Stacks vertically on mobile. */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col md:flex-row md:basis-2/3 md:grow">
        <CategoryList categories={categories} active={active} onSelect={setActive} />
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
          <ErrorBoundary>
          <ProductList products={visible} loading={loading} onAdd={handleAdd} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Cart: static right column on desktop, slide-over drawer on mobile. */}
      <div
        className={
          'bg-white z-40 transition-transform duration-200 ' +
          'fixed inset-y-0 right-0 w-[85%] max-w-sm shadow-xl ' +
          'md:static md:z-auto md:w-auto md:max-w-md md:basis-1/3 md:min-w-[280px] md:shadow-none md:translate-x-0 ' +
          (cartOpen ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <Cart onClose={() => setCartOpen(false)} />
      </div>

      {/* Mobile backdrop when the cart drawer is open */}
      {cartOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Mobile floating button to open the cart */}
      <button
        onClick={() => setCartOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-brand text-white px-5 py-3 shadow-lg font-semibold"
      >
        🛒 {count} · {money(total)}
      </button>
    </div>
  );
}
