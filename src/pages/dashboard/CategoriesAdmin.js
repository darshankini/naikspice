import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';

export default function CategoriesAdmin({ onChange }) {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }

  const load = useCallback(() => {
    api.get('/categories').then(setRows).catch((e) => alert(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      if (editing) await api.put(`/categories/${editing.id}`, { name });
      else await api.post('/categories', { name });
      setName(''); setEditing(null); load(); onChange?.();
    } catch (err) { alert(err.message); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await api.del(`/categories/${id}`); load(); onChange?.();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Categories</h3>
      <form onSubmit={save} className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-brand"
        />
        <button className="px-3 py-1.5 rounded-md bg-brand text-white text-sm">{editing ? 'Update' : 'Add'}</button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setName(''); }} className="px-3 py-1.5 rounded-md bg-gray-200 text-sm">
            Cancel
          </button>
        )}
      </form>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="w-1/2 py-2">Category</th>
              <th className="w-1/2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="w-1/2 py-2 break-words">{c.name}</td>
                <td className="w-1/2 text-center whitespace-nowrap">
                  <button onClick={() => { setEditing(c); setName(c.name); }} className="hover:underline mr-3 bg-orange-600 hover:bg-orange-500 rounded-md text-white p-1">Edit</button>
                  <button onClick={() => del(c.id)} className="text-white hover:underline bg-red-600 hover:bg-red-500 rounded-md p-1 text-sm ">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
