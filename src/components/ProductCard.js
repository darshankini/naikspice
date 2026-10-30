import { memo } from 'react';
import { money, DEFAULT_GRAMS } from './Layout';

const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="52%" font-size="40" text-anchor="middle" fill="#9ca3af">🍴</text></svg>'
  );

// One product tile. memo'd so the grid doesn't re-render tiles that didn't change.
function ProductCard({ product, grams, onAdd, onDec, onInc }) {
  return (
    <div
      className="group flex flex-col rounded-lg border bg-white overflow-hidden text-left hover:shadow-md hover:border-brand transition"
    >
      <img
        src={product.image || FALLBACK}
        alt={product.name}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = FALLBACK; }}
        className="h-24 w-full object-cover bg-gray-100"
      />
      <div className="p-2">
        <div className="text-sm font-medium leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</div>
        <div className="mt-1 text-brand font-semibold whitespace-nowrap">
          {money(product.price)}<span className="text-xs font-normal text-gray-500">/kg</span>
        </div>
        <div className="mt-1.5 h-7 flex items-center">
          {grams > 0 ? (
            <div className="w-full flex items-center justify-between text-white">
              <button onClick={() => onDec(product.id)} className="h-7 w-7 rounded bg-brand hover:bg-brand-dark leading-none">−</button>
              <span className="text-center text-sm tabular-nums text-black whitespace-nowrap">{grams} g</span>
              <button onClick={() => onInc(product.id)} className="h-7 w-7 rounded bg-brand hover:bg-brand-dark leading-none">+</button>
            </div>
          ) : (
            <button onClick={() => onAdd(product)} className="w-full h-7 text-xs text-white bg-brand rounded-full font-semibold px-3 hover:bg-brand-dark">+ Add {DEFAULT_GRAMS} g</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
