import { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

// Responsive product grid (the scrollable 2/3 area).
export default function ProductList({ products, loading, onAdd }) {

  const {items,inc,dec} = useCart();
  const gramsById = useMemo(() => {
    const m = {};
    for(const i of items) m[i.id] = i.grams
    return m;
  },[items])


  if (loading) return <div className="p-6 text-gray-500">Loading products…</div>;
  if (!products.length) return <div className="p-6 text-gray-500">No products in this category.</div>;  

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd}  onInc={inc} onDec={dec} grams={gramsById[p.id] || 0}/>
      ))}
    </div>
  );
}
