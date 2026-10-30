import { memo } from 'react';

// Vertical, scrollable category rail. `active` is a category id or 'all'.
function CategoryList({ categories, active, onSelect }) {
  const item = (id, label) => {
    const on = active === id;
    return (
      <button
        key={id}
        onClick={() => onSelect(id)}
        className={
          'shrink-0 md:w-full text-left px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ' +
          (on ? 'bg-brand text-white' : 'text-gray-700 hover:bg-gray-100')
        }
      >
        {label}
      </button>
    );
  };

  return (
    <aside className="shrink-0 bg-white p-2 flex gap-1 overflow-x-auto border-b md:w-40 md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-b-0 md:border-r">
      {item('all', 'All Items')}
      {categories.map((c) => item(c.id, c.name))}
    </aside>
  );
}

export default memo(CategoryList);
