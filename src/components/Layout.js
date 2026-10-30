import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PrinterButton from './PrinterButton';

export const money = (n) => '₹ ' + Number(n).toFixed(2);
export const formattedDate = (n) => new Date(n).toLocaleString();

// Products are priced per kg and sold by weight in grams.
export const DEFAULT_GRAMS = 100; // weight added when a product is put in the cart
export const GRAM_STEP = 50;      // +/- button step
// Line amount for `grams` of a per-kg price, rounded to the paisa.
export const lineTotal = (pricePerKg, grams) => Math.round(Number(pricePerKg) * Number(grams) / 10) / 100;

function Header() {
  const { user, logout } = useAuth();
  const cart = useCart();
  const linkCls = ({ isActive }) =>
    'px-3 py-1.5 rounded-md text-sm font-medium ' +
    (isActive ? 'bg-white text-brand' : 'text-white/90 hover:bg-white/10');

  return (
    <header className="h-14 shrink-0 bg-brand text-white flex items-center px-3 sm:px-4 gap-2 sm:gap-4 shadow">
      <Link to="/" className="text-lg font-bold tracking-tight whitespace-nowrap">
        🍽️<span className="hidden sm:inline"> Restro POS</span>
      </Link>
      <nav className="flex gap-1">
        <NavLink to="/" end className={linkCls}>POS</NavLink>
        <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>
      </nav>
      <div className="ml-auto flex items-center gap-3 text-sm">
        {cart && <span className="hidden sm:inline">🛒 {cart.count}</span>}
        <PrinterButton />
        <span className="opacity-90">{user?.name || user?.username}</span>
        <button onClick={logout} className="px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25">
          Logout
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="h-8 shrink-0 bg-gray-800 text-gray-300 text-xs flex items-center justify-center">
      Restro POS &copy; {new Date().getFullYear()} — small restaurant point of sale
    </footer>
  );
}

// Protected shell: header + routed content + footer, full-height flex column.
export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return (
    <div className="h-full flex flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
