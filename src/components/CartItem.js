import { memo, useState, useEffect } from 'react';
import { money, lineTotal } from './Layout';

// One cart line: image, name, editable weight (grams) with +/- stepper, line total, remove.
function CartItem({ item, onInc, onDec, onSetGrams, onRemove }) {
  // Local draft so the field can be cleared/retyped without the item disappearing.
  const [draft, setDraft] = useState(String(item.grams));
  useEffect(() => setDraft(String(item.grams)), [item.grams]);

  const onType = (e) => {
    const v = e.target.value.replace(/\D/g, '');
    setDraft(v);
    const g = Number(v);
    if (g > 0) onSetGrams(item.id, g);
  };

  return (
    <li className="flex gap-2 py-2">
      <img
        src={item.image}
        alt=""
        className="h-10 w-10 rounded object-cover bg-gray-100 shrink-0"
      />
      <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-tight">{item.name}</div>
          <div className="text-xs text-gray-500">{money(item.price)}/kg</div>
        </div>
        <div className="text-right text-sm font-semibold tabular-nums whitespace-nowrap">{money(lineTotal(item.price, item.grams))}</div>
        <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 leading-none" title="Remove">✕</button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onDec(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none" >−</button>
        <label className="flex items-center rounded border focus-within:border-brand px-1">
          <input
            value={draft}
            onChange={onType}
            onBlur={() => setDraft(String(item.grams))}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            aria-label={`Weight of ${item.name} in grams`}
            className="w-12 py-0.5 text-right text-sm tabular-nums outline-none"
          />
          <span className="text-xs text-gray-500 pl-0.5">g</span>
        </label>
        <button onClick={() => onInc(item.id)} className="h-6 w-6 rounded bg-gray-200 hover:bg-gray-300 leading-none">+</button>
      </div>
      </div>
    </li>
  );
}

export default memo(CartItem);
