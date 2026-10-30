import { useEffect, useState, useCallback } from 'react';
import { api } from '../../api';
import { money } from '../../components/Layout';
import toast from "react-hot-toast";

const EMPTY = { name: '', price: '', category_id: '', image: '' };

export default function ProductsAdmin() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([p, c]) => { setRows(p); setCats(c); })
      .catch((e) => alert(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => { setForm(EMPTY); setEditingId(null); };

  // Upload the chosen file, then keep the returned URL on the form (image stays optional).
  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-selected later
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { url } = await api.upload('/products/upload', fd);
      setForm((f) => ({ ...f, image: url }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.price === '') return;
    const body = {
      name: form.name,
      price: Number(form.price),
      category_id: form.category_id ? Number(form.category_id) : null,
      image: form.image || null,
    };
    try {
      if (editingId){
        await api.put(`/products/${editingId}`, body);
        toast.success("Product updated successfully!",{
          position: "top-center"
        });
      }else{
        await api.post('/products', body);
        toast.success("Product added successfully!",{
          position: "top-center"
        });
      }
      reset(); load();
    } catch (err) { alert(err.message); }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, category_id: p.category_id || '', image: p.image || '' });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.del(`/products/${id}`); load();
  };

  const input = 'rounded-md border px-3 py-1.5 text-sm outline-none focus:border-brand';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Products</h3>
      <form onSubmit={save} className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <input className={input} placeholder="Name" value={form.name} onChange={set('name')} required />
        <input className={input} placeholder="Price per kg" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
        <select className={input} value={form.category_id} onChange={set('category_id')}>
          <option value="">No category</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="col-span-2 md:col-span-1 flex items-center gap-2 min-w-0">
          <label
            className={
              input +
              ' cursor-pointer bg-gray-50 hover:bg-gray-100 whitespace-nowrap ' +
              (uploading ? 'opacity-60 pointer-events-none' : '')
            }
          >
            {uploading ? 'Uploading…' : form.image ? 'Change' : 'Image'}
            <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
          </label>
          {form.image && !uploading && (
            <>
              <img src={form.image} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: '' }))}
                className="text-gray-400 hover:text-red-500 shrink-0"
                title="Remove image"
                aria-label="Remove image"
              >
                ✕
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <button disabled={uploading} className="flex-1 px-3 py-1.5 rounded-md bg-brand text-white text-sm disabled:opacity-50">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={reset} className="px-3 py-1.5 rounded-md bg-gray-200 text-sm">Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr><th className="px-3 py-2 text-center">Image</th><th className="px-3 py-2 text-center">Item</th><th className="px-3 text-center">Category</th><th className="px-3 text-center">Price / kg</th><th className='px-3 text-center'>Action</th></tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2 flex items-center gap-2 justify-center">
                  {p.image && <img src={p.image} alt="" className="h-8 w-8 rounded object-cover items-center" />}
                  
                </td>
                <td className="px-3 text-center">{p.name}</td>
                <td className="px-3 text-center text-gray-500">{p.category || '—'}</td>
                <td className="px-3 text-center tabular-nums">{money(p.price)}</td>
                <td className="px-3 text-center whitespace-nowrap">
                  <button onClick={() => edit(p)} className="text-center hover:underline mr-3 rounded-md text-white bg-orange-600 hover:bg-orange-500 p-1">Edit</button>
                  <button onClick={() => del(p.id)} className="text-center hover:underline rounded-md text-white bg-red-600 hover:bg-red-500 p-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
